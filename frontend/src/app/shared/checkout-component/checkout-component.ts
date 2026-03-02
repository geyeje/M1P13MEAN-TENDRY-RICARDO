import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StripeService } from '../../core/services/stripe-service';
import { ShoppingCartService } from '../../core/services/shopping-cart.service';
import { AuthService } from '../../core/services/auth.service';
import { StripeElements } from '@stripe/stripe-js';

interface ShippingForm {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

@Component({
  selector: 'app-checkout-component',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout-component.html',
  styleUrl: './checkout-component.scss',
})
export class CheckoutComponent implements OnInit {
  private stripeService = inject(StripeService);
  cartService = inject(ShoppingCartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // ✅ Signaux pour l'état du composant
  isLoading = signal(false);
  clientSecret = signal<string | null>(null);
  paymentIntentId = signal<string | null>(null);
  stripeElements = signal<StripeElements | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  step = signal<'shipping' | 'payment' | 'confirmation'>('shipping');

  // Computed: Montant total du panier
  cartTotal = computed(() => {
    const items = this.cartService.items();
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  });

  // Computed: Nombre d'articles
  cartItemCount = computed(() => {
    return this.cartService.items().reduce((sum, item) => sum + item.quantity, 0);
  });

  // Formulaire d'adresse de livraison
  shippingForm: FormGroup;

  constructor() {
    this.shippingForm = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      country: ['France', Validators.required],
    });
  }

  ngOnInit(): void {
    // Vérifier que l'utilisateur est connecté
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' }
      });
      return;
    }

    // Vérifier que le panier n'est pas vide
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/shopping-cart']);
      return;
    }
  }

  /**
   * Étape 1: Valider l'adresse et créer le PaymentIntent
   */
  async proceedToPayment(): Promise<void> {
    if (!this.shippingForm.valid) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return;
    }

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      let currentUser: any = null;
      this.authService.currentUser$.subscribe(user => {
        currentUser = user;
      });
      if (!currentUser?.email) {
        throw new Error('Email utilisateur non trouvé');
      }

      // 1️⃣ Créer le PaymentIntent sur le serveur
      const response = await this.stripeService.createPaymentIntent(
        this.cartTotal(),
        this.cartService.items(),
        currentUser.email
      );

      this.clientSecret.set(response.clientSecret);
      this.paymentIntentId.set(response.intentId);

      // 2️⃣ Initialiser les Stripe Elements
      const elements = await this.stripeService.initializeElements(response.clientSecret);
      if (!elements) {
        throw new Error('Impossible d\'initialiser Stripe');
      }

      this.stripeElements.set(elements);

      // 3️⃣ Monter le Payment Element dans le DOM
      setTimeout(() => {
        const container = document.getElementById('payment-element');
        if (container && elements) {
          const paymentElement = elements.create('payment');
          paymentElement.mount('#payment-element');
        }
      }, 0);

      // Passer à l'étape du paiement
      this.step.set('payment');

    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Erreur lors de la préparation du paiement');
      console.error('Erreur préparation paiement:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Étape 2: Traiter le paiement
   */
  async pay(): Promise<void> {
    const elements = this.stripeElements();
    const intentId = this.paymentIntentId();

    if (!elements || !intentId) {
      this.errorMessage.set('Erreur: état du paiement invalide');
      return;
    }

    try {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      // ✅ Confirmer le paiement avec Stripe
      const paymentResult = await this.stripeService.confirmPayment(elements);

      if (!paymentResult.success) {
        throw new Error(paymentResult.error?.message || 'Paiement échoué');
      }

      // ✅ Paiement réussi, créer la commande côté serveur
      const confirmResult = await this.stripeService.confirmOrder({
        paymentIntentId: intentId,
        shippingAddress: this.shippingForm.value,
        cartItems: this.cartService.items().map(item => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
      });

      if (!confirmResult.success) {
        throw new Error(confirmResult.error);
      }

      // ✅ Succès!
      this.successMessage.set('Commande confirmée avec succès!');
      this.step.set('confirmation');

      // Vider le panier
      this.cartService.clear();

      // Rediriger après 2 secondes
      setTimeout(() => {
        this.router.navigate(['/order-success'], {
          queryParams: { orderId: confirmResult.orderId }
        });
      }, 2000);

    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Erreur lors du paiement');
      console.error('Erreur paiement:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Retour à l'étape précédente
   */
  goBack(): void {
    if (this.step() === 'payment') {
      this.step.set('shipping');
      this.errorMessage.set(null);
    }
  }

  /**
   * Annuler et retourner au panier
   */
  cancel(): void {
    if (confirm('Êtes-vous sûr? Les données saisies seront perdues.')) {
      this.router.navigate(['/shopping-cart']);
    }
  }
}
