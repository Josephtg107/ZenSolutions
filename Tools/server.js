/**
 * Backend para Zen Solutions - Sistema de Pagos con Stripe
 * Archivo: server.js (Node.js + Express)
 */

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51234567890abcdef...');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Base de datos simple (en producción usar PostgreSQL/MongoDB)
const subscriptions = new Map();
const customers = new Map();

// Configuración del producto en Stripe
const PRODUCT_CONFIG = {
  name: 'Zen Premium',
  description: 'Acceso ilimitado a todas las herramientas Zen Solutions',
  price: parseInt(process.env.SUBSCRIPTION_PRICE) || 5000, // 50 MXN en centavos
  currency: process.env.SUBSCRIPTION_CURRENCY || 'mxn',
  interval: process.env.SUBSCRIPTION_INTERVAL || 'month'
};

// Configuración de URLs
const BASE_URL = process.env.BASE_URL || 'http://localhost:6970';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_1234567890abcdef...';
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_zen_premium_monthly';

// Crear producto y precio en Stripe (ejecutar una sola vez)
async function createStripeProduct() {
  try {
    const product = await stripe.products.create({
      name: PRODUCT_CONFIG.name,
      description: PRODUCT_CONFIG.description,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: PRODUCT_CONFIG.price,
      currency: PRODUCT_CONFIG.currency,
      recurring: {
        interval: PRODUCT_CONFIG.interval,
      },
    });

    console.log('Producto creado:', product.id);
    console.log('Precio creado:', price.id);
    console.log('Guarda estos IDs en tu configuración');
  } catch (error) {
    console.error('Error creando producto:', error);
  }
}

// Endpoint para crear sesión de checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { email, successUrl, cancelUrl } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        source: 'zen_tools'
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creando checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para crear sesión del portal del cliente
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creando portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para verificar estado del pago
app.get('/api/verify-payment/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Buscar la suscripción
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      
      res.json({
        status: 'complete',
        customerId: session.customer,
        subscriptionId: session.subscription,
        subscriptionStatus: subscription.status
      });
    } else {
      res.json({
        status: 'pending',
        paymentStatus: session.payment_status
      });
    }
  } catch (error) {
    console.error('Error verificando pago:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook para manejar eventos de Stripe
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar diferentes tipos de eventos
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout completado:', session.id);
      // Aquí puedes activar premium inmediatamente
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Pago mensual exitoso:', invoice.id);
      // Renovar suscripción automáticamente
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('Pago fallido:', failedInvoice.id);
      // Manejar pago fallido
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      console.log('Suscripción cancelada:', subscription.id);
      // Desactivar premium
      break;

    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({received: true});
});

// Endpoint para obtener información de suscripción
app.get('/api/subscription/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    });

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      res.json({
        active: true,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
    } else {
      res.json({ active: false });
    }
  } catch (error) {
    console.error('Error obteniendo suscripción:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para cancelar suscripción
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    res.json({ 
      success: true, 
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: subscription.current_period_end
    });
  } catch (error) {
    console.error('Error cancelando suscripción:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 6970;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📦 Entorno: ${NODE_ENV}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  if (NODE_ENV === 'development') {
    console.log('💡 Para crear el producto en Stripe, ejecuta: createStripeProduct()');
  }
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso.`);
    console.error(`💡 Intenta: lsof -ti:${PORT} | xargs kill -9`);
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
  }
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;
