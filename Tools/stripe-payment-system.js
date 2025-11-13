/**
 * Sistema de Pagos con Stripe para Zen Solutions
 * Backend para manejar suscripciones y webhooks
 */

// Configuración de Stripe (usa variables de entorno en producción)
const STRIPE_CONFIG = {
  // Claves de prueba (reemplazar con claves de producción)
  publishableKey: window.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef...', // Tu clave pública
  secretKey: 'sk_test_51234567890abcdef...', // Solo en backend
  webhookSecret: 'whsec_1234567890abcdef...', // Solo en backend
  
  // Configuración del producto
  productId: window.STRIPE_PRODUCT_ID || 'prod_zen_premium', // ID del producto en Stripe
  priceId: window.STRIPE_PRICE_ID || 'price_zen_premium_monthly', // ID del precio mensual
  
  // Precio en centavos (50 MXN = 5000 centavos)
  amount: 5000,
  currency: 'mxn'
};

class StripePaymentSystem {
  constructor() {
    this.stripe = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      // Cargar Stripe.js dinámicamente
      if (!window.Stripe) {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => this.initializeStripe();
        document.head.appendChild(script);
      } else {
        this.initializeStripe();
      }
    } catch (error) {
      console.error('Error inicializando Stripe:', error);
    }
  }

  initializeStripe() {
    try {
      this.stripe = Stripe(STRIPE_CONFIG.publishableKey);
      this.isInitialized = true;
      console.log('Stripe inicializado correctamente');
    } catch (error) {
      console.error('Error configurando Stripe:', error);
    }
  }

  async createCheckoutSession(userEmail = null) {
    if (!this.isInitialized) {
      throw new Error('Stripe no está inicializado');
    }

    try {
      // Crear sesión de checkout en el backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          priceId: STRIPE_CONFIG.priceId,
          successUrl: `${window.location.origin}/Tools/subscription.html?success=true`,
          cancelUrl: `${window.location.origin}/Tools/subscription.html?canceled=true`
        })
      });

      if (!response.ok) {
        throw new Error('Error creando sesión de checkout');
      }

      const { sessionId } = await response.json();
      
      // Redirigir a Stripe Checkout
      const result = await this.stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Error en checkout:', error);
      throw error;
    }
  }

  async createCustomerPortalSession(customerId) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
          returnUrl: `${window.location.origin}/Tools/subscription.html`
        })
      });

      if (!response.ok) {
        throw new Error('Error creando sesión del portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error abriendo portal:', error);
      throw error;
    }
  }

  async verifyPaymentStatus(sessionId) {
    try {
      const response = await fetch(`/api/verify-payment/${sessionId}`);
      if (!response.ok) {
        throw new Error('Error verificando pago');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verificando pago:', error);
      throw error;
    }
  }

  // Método para manejar el éxito del pago
  async handlePaymentSuccess(sessionId) {
    try {
      const paymentData = await this.verifyPaymentStatus(sessionId);
      
      if (paymentData.status === 'complete') {
        // Activar premium en el sistema local
        const premiumData = {
          active: true,
          startDate: new Date().toISOString(),
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          plan: 'monthly',
          stripeCustomerId: paymentData.customerId,
          stripeSubscriptionId: paymentData.subscriptionId
        };
        
        localStorage.setItem('zen_tools_premium', JSON.stringify(premiumData));
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage();
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error manejando éxito del pago:', error);
      return false;
    }
  }

  showSuccessMessage() {
    const modal = document.createElement('div');
    modal.className = 'payment-success-modal';
    modal.innerHTML = `
      <div class="payment-success-content">
        <div class="success-icon">🎉</div>
        <h3>¡Pago Exitoso!</h3>
        <p>Tu suscripción premium ha sido activada. Ya puedes disfrutar de todas las características premium.</p>
        <button onclick="this.closest('.payment-success-modal').remove(); location.reload();" class="success-btn">
          ¡Empezar a Usar Premium!
        </button>
      </div>
    `;

    // Agregar estilos
    const style = document.createElement('style');
    style.textContent = `
      .payment-success-modal {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8); display: flex; align-items: center;
        justify-content: center; z-index: 10000; font-family: 'Inter', sans-serif;
      }
      .payment-success-content {
        background: white; border-radius: 16px; padding: 2rem; text-align: center;
        max-width: 400px; width: 90%; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
      .success-icon { font-size: 3rem; margin-bottom: 1rem; }
      .payment-success-content h3 { margin: 0 0 1rem 0; color: #1f2937; font-size: 1.5rem; }
      .payment-success-content p { margin: 0 0 1.5rem 0; color: #374151; }
      .success-btn {
        background: linear-gradient(135deg, #a78bfa, #d4ff65); color: #1f2937;
        border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;
        cursor: pointer; font-size: 1rem; transition: transform 0.2s;
      }
      .success-btn:hover { transform: translateY(-1px); }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
  }
}

// Crear instancia global
window.stripePaymentSystem = new StripePaymentSystem();
