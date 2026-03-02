import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeElementsOptions } from '@stripe/stripe-js';
import { firstValueFrom } from 'rxjs';
import { signal } from '@angular/core';
import { environment } from '../../../environments/environment';

interface PaymentIntentResponse {
  clientSecret: string;
  intentId: string;
  amount: number;
  currency: string;
}

interface PaymentConfirmRequest {
  paymentIntentId: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  cartItems: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  private http = inject(HttpClient);
  
  // ✅ Clé PUBLIQUE (publishable key)
  private stripePromise = loadStripe('pk_test_51T6GHF9bqT14xCYZAaMCtnR9rAvFLrBCUykBiSK1g5HewjZSRmBuM2xNSVeZen1ZH2YXGff3cQqEd6Ex96aMACg00xnYZJNMi');
  
  isLoading = signal(false);
  error = signal<string | null>(null);

  /**
   * 1️⃣ Créer un PaymentIntent sur le serveur
   * Retourne le clientSecret pour initialiser les éléments
   */
  async createPaymentIntent(
    amount: number,
    items: any[],
    userEmail: string
  ): Promise<PaymentIntentResponse> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const response = await firstValueFrom(
        this.http.post<PaymentIntentResponse>(
          `${environment.apiUrl}/payments/create-intent`,
          { amount, items, userEmail }
        )
      );

      return response;
    } catch (err: any) {
      const errorMsg = err?.error?.error || 'Erreur lors de la création du paiement';
      this.error.set(errorMsg);
      throw new Error(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 2️⃣ Initialiser les Stripe Elements
   * Doit être appelé APRÈS avoir obtenu le clientSecret
   */
  async initializeElements(clientSecret: string): Promise<StripeElements | null> {
    try {
      const stripe = await this.stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Options pour les éléments
      const options: any = {
        clientSecret, // ✅ Lié au PaymentIntent
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#00ba00', // Matcha green
            colorBackground: '#1a1a1a',
            fontFamily: 'system-ui, sans-serif',
          },
        },
      };

      const elements = stripe.elements(options as any);
      return elements;
    } catch (err) {
      console.error('Erreur initialisation éléments:', err);
      return null;
    }
  }

  /**
   * 3️⃣ Confirmer le paiement
   * Charge la carte et confirme le PaymentIntent
   */
  async confirmPayment(elements: StripeElements) {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const stripe = await this.stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      // ✅ confirmPayment gère 3D Secure automatiquement
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', // Redirect si 3D Secure requis
      });

      if (result.error) {
        // Erreur de paiement (carte refusée, etc.)
        this.error.set(result.error.message || 'Erreur de paiement');
        return { success: false, error: result.error };
      }

      // ✅ Paiement réussi ou nécessite redirection pour 3D Secure
      return { success: true, paymentIntent: result.paymentIntent };
    } catch (err: any) {
      const errorMsg = err?.message || 'Erreur confirmation paiement';
      this.error.set(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 4️⃣ Confirmer la commande côté serveur
   * Appelé APRÈS que confirmPayment() ait réussi
   */
  async confirmOrder(request: PaymentConfirmRequest) {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      const response = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/payments/confirm`, request)
      );

      return { success: true, orderId: response.orderId };
    } catch (err: any) {
      const errorMsg = err?.error?.error || 'Erreur confirmation commande';
      this.error.set(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * 5️⃣ Récupérer la clé publique (rarement nécessaire)
   */
  async getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  /**
   * Simuler un test de paiement (DEV)
   * Carte de test: 4242 4242 4242 4242
   */
  getTestCards() {
    return {
      success: '4242 4242 4242 4242',
      declined: '4000 0000 0000 0002',
      requiresAuth: '4000 0025 0000 3155',
    };
  }
}

