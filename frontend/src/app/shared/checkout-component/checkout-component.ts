import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
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

    // ✅ Monter le PaymentElement quand on passe à l'étape payment
    effect(() => {
      if (this.step() === 'payment' && this.stripeElements()) {
        // Attendre que Angular ait rendu le DOM
        requestAnimationFrame(() => {
          this.mountPaymentElement();
        });
      }
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
      console.log('👉 Étape 1: Création du PaymentIntent');

      const currentUser: any = null;
      let user: any = null;
      this.authService.currentUser$.subscribe(u => { user = u; });
      
      if (!user?.email) {
        throw new Error('Email utilisateur non trouvé');
      }
      console.log('✅ User:', user.email);

      // 1️⃣ Créer le PaymentIntent sur le serveur
      console.log('📍 Appel createPaymentIntent...');
      const response = await this.stripeService.createPaymentIntent(
        this.cartTotal(),
        this.cartService.items(),
        user.email
      );
      console.log('✅ PaymentIntent créé:', response);

      this.clientSecret.set(response.clientSecret);
      this.paymentIntentId.set(response.intentId);

      // 2️⃣ Initialiser les Stripe Elements
      console.log('📍 Initialisation des Stripe Elements...');
      const elements = await this.stripeService.initializeElements(response.clientSecret);
      if (!elements) {
        throw new Error('Impossible d\'initialiser Stripe');
      }
      console.log('✅ Stripe Elements initialisés');

      this.stripeElements.set(elements);

      // Passer à l'étape du paiement
      // (l'effect dans le constructor va monter automatiquement le PaymentElement)
      console.log('📍 Changement vers étape payment');
      this.step.set('payment');
      console.log('✅ Étape 1 complète, passé à étape 2');

    } catch (error: any) {
      this.errorMessage.set(error?.message || 'Erreur lors de la préparation du paiement');
      console.error('❌ Erreur étape 1:', error);
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
      console.log('💳 Étape 2: Confirmation du paiement Stripe');

      // ✅ Confirmer le paiement avec Stripe
      console.log('📍 Appel confirmPayment...');
      const paymentResult = await this.stripeService.confirmPayment(elements);
      console.log('✅ Résultat confirmPayment:', paymentResult);

      if (!paymentResult.success) {
        const errorMsg = typeof paymentResult.error === 'string' 
          ? paymentResult.error 
          : paymentResult.error?.message || 'Paiement échoué';
        throw new Error(errorMsg);
      }

      // ✅ Paiement réussi, créer la commande côté serveur
      console.log('📍 Appel confirmOrder...');
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
      console.log('✅ Résultat confirmOrder:', confirmResult);

      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'Erreur confirmation commande');
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
      const errorMsg = error?.message || 'Erreur lors du paiement';
      this.errorMessage.set(errorMsg);
      console.error('❌ Erreur étape 2 paiement:', error);
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

  /**
   * Monter le Payment Element dans le DOM
   */
  private mountPaymentElement(): void {
    try {
      const elements = this.stripeElements();
      const container = document.getElementById('payment-element');

      console.log('🔧 mountPaymentElement called');
      console.log('Elements:', elements);
      console.log('Container:', container);

      if (!container) {
        console.error('❌ Conteneur payment-element non trouvé');
        this.errorMessage.set('Conteneur de paiement non trouvé');
        return;
      }

      if (!elements) {
        console.error('❌ StripeElements non initialisé');
        this.errorMessage.set('Stripe non initialisé');
        return;
      }

      // Nettoyer les enfants existants
      container.innerHTML = '';
      console.log('✅ Container nettoyé');

      // ✅ Créer et monter le Payment Element
      console.log('📍 Création du paymentElement...');
      const paymentElement = elements.create('payment');
      console.log('📍 paymentElement créé:', paymentElement);

      // écouter les erreurs de chargement
      paymentElement.on('loaderror', (evt: any) => {
        console.error('⚠️ paymentElement loaderror event:', evt);
        this.errorMessage.set('Erreur chargement formulaire :' + (evt.error?.message || evt.error));
      });
      paymentElement.on('ready', () => {
        console.log('✅ paymentElement ready event');
      });

      console.log('📍 Mounting sur #payment-element...');
      paymentElement.mount('#payment-element');
      console.log('✅ PaymentElement monté avec succès');

    } catch (error) {
      console.error('❌ Erreur mounting PaymentElement:', error);
      this.errorMessage.set(`Erreur Stripe: ${error}`);
    }
  }
}
