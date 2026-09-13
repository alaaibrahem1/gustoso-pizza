import { PaymentMethodType } from '../types';

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string; // MM/YY
  cvv: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentMethodType;
  card?: CardDetails;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  metadata?: Record<string, string | number | boolean>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentMethod: PaymentMethodType;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed';
  errorMessage?: string;
  timestamp: string;
}

/**
 * PaymentGatewayProvider interface.
 * Any real provider (Stripe, Moyasar, PayPal, Square, Adyen) implements this contract.
 */
export interface PaymentGatewayProvider {
  name: string;
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  validateCard(card: CardDetails): { valid: boolean; error?: string };
}

/**
 * Development / Mock Payment Gateway Provider.
 * Simulates realistic network latency, authorization checks, and test card validations.
 */
class DevPaymentGatewayProvider implements PaymentGatewayProvider {
  name = 'Development Simulated Gateway (Stripe/Moyasar Mock)';

  validateCard(card: CardDetails): { valid: boolean; error?: string } {
    const cleanNumber = card.cardNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 15 || cleanNumber.length > 19) {
      return { valid: false, error: 'Invalid card number length' };
    }
    if (!/^\d+$/.test(cleanNumber)) {
      return { valid: false, error: 'Card number contains invalid characters' };
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiryDate)) {
      return { valid: false, error: 'Invalid expiry date format (MM/YY)' };
    }
    if (card.cvv.length < 3 || card.cvv.length > 4) {
      return { valid: false, error: 'Invalid CVV code' };
    }
    return { valid: true };
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate real gateway processing latency
    await new Promise((resolve) => setTimeout(resolve, 1400));

    // Handle Cash on Delivery
    if (request.method === 'cod') {
      return {
        success: true,
        transactionId: `COD-${Date.now().toString().slice(-6)}`,
        paymentMethod: 'cod',
        amount: request.amount,
        currency: request.currency,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
    }

    // Handle Digital Wallets (Apple Pay / Google Pay)
    if (request.method === 'apple_pay' || request.method === 'google_pay') {
      return {
        success: true,
        transactionId: `WALLET-${request.method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentMethod: request.method,
        amount: request.amount,
        currency: request.currency,
        status: 'succeeded',
        timestamp: new Date().toISOString(),
      };
    }

    // Handle Card Payment
    if (request.method === 'card') {
      if (request.card) {
        const validation = this.validateCard(request.card);
        if (!validation.valid) {
          return {
            success: false,
            paymentMethod: 'card',
            amount: request.amount,
            currency: request.currency,
            status: 'failed',
            errorMessage: validation.error || 'Payment card validation failed',
            timestamp: new Date().toISOString(),
          };
        }
      }

      return {
        success: true,
        transactionId: `TXN-CARD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        paymentMethod: 'card',
        amount: request.amount,
        currency: request.currency,
        status: 'succeeded',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      paymentMethod: request.method,
      amount: request.amount,
      currency: request.currency,
      status: 'failed',
      errorMessage: 'Unsupported payment method',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Singleton Payment Service abstraction.
 * To integrate Stripe or another real gateway:
 * Replace or configure `activeProvider` with StripePaymentGatewayProvider.
 */
class PaymentService {
  private activeProvider: PaymentGatewayProvider;

  constructor() {
    this.activeProvider = new DevPaymentGatewayProvider();
  }

  public setProvider(provider: PaymentGatewayProvider) {
    this.activeProvider = provider;
  }

  public getProviderName(): string {
    return this.activeProvider.name;
  }

  public async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    return this.activeProvider.processPayment(request);
  }

  public validateCard(card: CardDetails): { valid: boolean; error?: string } {
    return this.activeProvider.validateCard(card);
  }
}

export const paymentService = new PaymentService();
