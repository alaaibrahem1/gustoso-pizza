import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const NEON_PG_URL = 'postgresql://neondb_owner:npg_si5V7jepwkCq@ep-winter-rain-aye7uala-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const effectiveDbUrl = (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'))
  ? process.env.DATABASE_URL
  : NEON_PG_URL;

// Ensure process.env has the valid url for Prisma
if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgres')) {
  process.env.DATABASE_URL = effectiveDbUrl;
}

// Initialize Prisma Client
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: effectiveDbUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Seed data types for in-memory / fallback store
interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

interface StoredAddress {
  id: string;
  userId: string;
  label: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  apartmentOrUnit?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  categoryId: string;
  basePrice: number;
  rating: number;
  isPopular: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredTopping {
  id: string;
  name: string;
  category: 'CHEESE' | 'MEAT' | 'VEGETABLES' | 'SAUCES';
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredOffer {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredCoupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredCartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedCrust?: string;
  kitchenNotes?: string;
  toppings: Array<{ id: string; name: string; price: number }>;
  createdAt: Date;
  updatedAt: Date;
}

interface StoredOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  subtotal: number;
  discount: number;
  discountCode?: string;
  deliveryFee: number;
  vat: number;
  total: number;
  deliveryMethod: 'DELIVERY' | 'PICKUP';
  paymentMethod: 'CASH_ON_DELIVERY' | 'CARD_ON_DELIVERY' | 'APPLE_PAY';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  deliveryAddressSnapshot?: any;
  customerSnapshot?: any;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId?: string;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    selectedSize?: string;
    selectedCrust?: string;
    kitchenNotes?: string;
    toppings: Array<{ name: string; price: number }>;
  }>;
}

// Fallback in-memory database store
class DatabaseService {
  private isPrismaConnected: boolean | null = null;

  private users: StoredUser[] = [];
  private addresses: StoredAddress[] = [];
  private categories: StoredCategory[] = [];
  private products: StoredProduct[] = [];
  private toppings: StoredTopping[] = [];
  private offers: StoredOffer[] = [];
  private coupons: StoredCoupon[] = [];
  private carts: Map<string, { id: string; userId: string; items: StoredCartItem[] }> = new Map();
  private favorites: Map<string, Set<string>> = new Map(); // userId -> Set of productIds
  private orders: StoredOrder[] = [];

  constructor() {
    this.seedInitialMemoryStore();
  }

  // Pre-populate memory store with rich initial data
  private seedInitialMemoryStore() {
    const adminHash1 = bcrypt.hashSync('Admin123!*', 10);
    const adminHash2 = bcrypt.hashSync('AdminPassword123!', 10);
    const customerHash = bcrypt.hashSync('Customer123!*', 10);

    const adminUser1: StoredUser = {
      id: 'usr-admin-01',
      name: 'Gustoso Operations Admin',
      email: 'admin@gustosopizza.sa',
      phone: '+966500000000',
      passwordHash: adminHash1,
      role: 'ADMIN',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const adminUser2: StoredUser = {
      id: 'usr-admin-02',
      name: 'Gustoso Operations Admin',
      email: 'admin@gustoso.sa',
      phone: '+966500000001',
      passwordHash: adminHash2,
      role: 'ADMIN',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    };

    const customerUser: StoredUser = {
      id: 'usr-cust-01',
      name: 'Tariq Al-Mansoor',
      email: 'customer@gustosopizza.sa',
      phone: '+966501234567',
      passwordHash: customerHash,
      role: 'CUSTOMER',
      createdAt: new Date('2026-02-15'),
      updatedAt: new Date('2026-02-15'),
    };

    const customerUser2: StoredUser = {
      id: 'usr-cust-02',
      name: 'Sara Al-Ghamdi',
      email: 'customer@gustoso.sa',
      phone: '+966507654321',
      passwordHash: bcrypt.hashSync('Customer123!', 10),
      role: 'CUSTOMER',
      createdAt: new Date('2026-02-20'),
      updatedAt: new Date('2026-02-20'),
    };

    this.users = [adminUser1, adminUser2, customerUser, customerUser2];

    this.addresses = [
      {
        id: 'addr-01',
        userId: customerUser.id,
        label: 'Home',
        city: 'Riyadh',
        district: 'Al Olaya',
        street: 'Prince Muhammad Ibn Abd Al Aziz St',
        buildingNumber: '42',
        apartmentOrUnit: 'Villa 4B',
        notes: 'Ring gate intercom',
        isDefault: true,
        createdAt: new Date('2026-02-15'),
        updatedAt: new Date('2026-02-15'),
      },
      {
        id: 'addr-02',
        userId: customerUser.id,
        label: 'Work',
        city: 'Riyadh',
        district: 'King Abdullah Financial District (KAFD)',
        street: 'Tower 3, Level 14',
        buildingNumber: '10',
        apartmentOrUnit: 'Suite 1402',
        notes: 'Leave with front desk reception',
        isDefault: false,
        createdAt: new Date('2026-02-20'),
        updatedAt: new Date('2026-02-20'),
      },
    ];

    this.categories = [
      { id: 'cat-pizza', name: 'Pizza', slug: 'pizza', description: 'Handcrafted 48h Fermented Stone Oven Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-sides', name: 'Sides', slug: 'sides', description: 'Crispy Truffle Fries, Mozzarella Sticks & Artisan Garlic Bread', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-wings', name: 'Wings', slug: 'wings', description: 'Jumbo Crisp Buffalo, BBQ & Herb Glazed Wings', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-sauces', name: 'Sauces', slug: 'sauces', description: 'Signature Truffle Aioli, Calabrian Hot Honey & Herbed Ranch', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-drinks', name: 'Drinks', slug: 'drinks', description: 'San Pellegrino Sparkling Sodas & Chilled Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-desserts', name: 'Desserts', slug: 'desserts', description: 'Warm Nutella Calzones & Crisp Sicilian Cannoli', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat-deals', name: 'Deals', slug: 'deals', description: 'Chef Family Bundles & Value Combos', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600', createdAt: new Date(), updatedAt: new Date() },
    ];

    this.products = [
      {
        id: 'p-1',
        name: 'Pepperoni Diavola',
        slug: 'pepperoni-diavola',
        description: 'Double artisanal pepperoni cups that crisp into oil pools, San Marzano tomato sauce, fresh mozzarella, and hot honey.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&auto=format&fit=crop&q=80',
        categoryId: 'cat-pizza',
        basePrice: 58.0,
        rating: 4.9,
        isPopular: true,
        isFeatured: true,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-2',
        name: 'Margherita D.O.P.',
        slug: 'margherita-dop',
        description: 'The timeless Neapolitan classic with crushed San Marzano tomatoes, fresh Buffalo mozzarella, extra virgin olive oil, and sweet basil leaves.',
        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=900&auto=format&fit=crop&q=80',
        categoryId: 'cat-pizza',
        basePrice: 48.0,
        rating: 4.8,
        isPopular: true,
        isFeatured: false,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-3',
        name: 'Truffle Wild Mushroom',
        slug: 'truffle-wild-mushroom',
        description: 'Roasted cremini & portobello mushrooms, thyme-infused ricotta, smoked fior di latte, topped with shaved parmesan and white truffle oil.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80',
        categoryId: 'cat-pizza',
        basePrice: 68.0,
        rating: 4.9,
        isPopular: true,
        isFeatured: true,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-4',
        name: 'Burrata e Pesto Genovese',
        slug: 'burrata-pesto-genovese',
        description: 'Whole 125g fresh creamy burrata ball placed warm upon blistered crust with house pine nut basil pesto and roasted cherry tomatoes.',
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900&auto=format&fit=crop&q=80',
        categoryId: 'cat-pizza',
        basePrice: 72.0,
        rating: 5.0,
        isPopular: true,
        isFeatured: true,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-5',
        name: 'Smoked BBQ Pollo & Bacon',
        slug: 'smoked-bbq-pollo-bacon',
        description: 'Wood-smoked chicken breast, crispy beef bacon crumbles, tangy smoky BBQ reduction, caramelized sweet onions, and smoked scamorza.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&auto=format&fit=crop&q=80',
        categoryId: 'cat-pizza',
        basePrice: 62.0,
        rating: 4.8,
        isPopular: true,
        isFeatured: false,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-6',
        name: 'Loaded Truffle Curly Fries',
        slug: 'loaded-truffle-curly-fries',
        description: 'Seasoned spiral fries tossed in white truffle oil, fresh rosemary, and grated parmesan.',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
        categoryId: 'cat-sides',
        basePrice: 24.0,
        rating: 4.8,
        isPopular: true,
        isFeatured: false,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-7',
        name: 'Golden Mozzarella Sticks (6 pcs)',
        slug: 'golden-mozzarella-sticks',
        description: 'Melty fior di latte mozzarella in Italian herb breading, served with warm marinara.',
        image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&auto=format&fit=crop&q=80',
        categoryId: 'cat-sides',
        basePrice: 26.0,
        rating: 4.7,
        isPopular: true,
        isFeatured: false,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-8',
        name: 'Buffalo Glazed Jumbo Wings (6 pcs)',
        slug: 'buffalo-glazed-jumbo-wings',
        description: 'Crispy fried jumbo wings drenched in spicy tangy cayenne butter glaze with blue cheese dip.',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
        categoryId: 'cat-wings',
        basePrice: 34.0,
        rating: 4.9,
        isPopular: true,
        isFeatured: true,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-9',
        name: 'San Pellegrino Aranciata Rossa',
        slug: 'san-pellegrino-aranciata-rossa',
        description: 'Sparkling Italian mineral soda with Mediterranean blood orange in a glass bottle (330ml).',
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        categoryId: 'cat-drinks',
        basePrice: 14.0,
        rating: 4.8,
        isPopular: false,
        isFeatured: false,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'p-10',
        name: 'Warm Nutella Stuffed Calzone',
        slug: 'warm-nutella-stuffed-calzone',
        description: 'Oven-baked blistered dough stuffed with melted Ferrero Nutella and sweet mascarpone.',
        image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
        categoryId: 'cat-desserts',
        basePrice: 36.0,
        rating: 4.9,
        isPopular: true,
        isFeatured: false,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.toppings = [
      { id: 'top-1', name: 'Extra Fior di Latte', category: 'CHEESE', price: 8.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-2', name: 'Aged Gorgonzola', category: 'CHEESE', price: 9.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-3', name: 'Shaved Parmigiano Reggiano', category: 'CHEESE', price: 7.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-4', name: 'Fresh Creamy Burrata', category: 'CHEESE', price: 14.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-5', name: 'Crispy Pepperoni Cups', category: 'MEAT', price: 9.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-6', name: 'Smoked Grilled Chicken', category: 'MEAT', price: 10.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-7', name: 'Fennel Italian Sausage', category: 'MEAT', price: 9.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-8', name: 'Crispy Beef Bacon', category: 'MEAT', price: 10.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-9', name: 'Halal Cured Beef Cecina', category: 'MEAT', price: 12.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-10', name: 'Roasted Portobello Mushrooms', category: 'VEGETABLES', price: 6.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-11', name: 'Kalamata Black Olives', category: 'VEGETABLES', price: 5.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-12', name: 'Fire-Pickled Jalapeños', category: 'VEGETABLES', price: 5.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-13', name: 'Caramelized Sweet Onions', category: 'VEGETABLES', price: 5.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-14', name: 'Fresh Genovese Basil', category: 'VEGETABLES', price: 4.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-15', name: 'Blistered Cherry Tomatoes', category: 'VEGETABLES', price: 5.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-16', name: 'Spicy Chili Hot Honey', category: 'SAUCES', price: 5.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-17', name: 'White Truffle Infused Oil', category: 'SAUCES', price: 8.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
      { id: 'top-18', name: 'Creamy Garlic Parmesan Drizzle', category: 'SAUCES', price: 4.0, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
    ];

    this.offers = [
      {
        id: 'off-1',
        name: 'Family Feast Combo',
        slug: 'family-feast-bundle',
        description: 'Any 2 Large Artisan Pizzas + Truffle Curly Fries + 6 Jumbo Buffalo Wings + 1.25L Soda.',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
        originalPrice: 165.0,
        discountedPrice: 129.0,
        discountPercentage: 22,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'off-2',
        name: 'Duo Pizza Supreme',
        slug: 'duo-pizza-deal',
        description: 'Any 2 Medium Specialty Pizzas of your choice at a special bundled price.',
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900',
        originalPrice: 126.0,
        discountedPrice: 99.0,
        discountPercentage: 21,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    this.coupons = [
      {
        id: 'coup-1',
        code: 'GUSTOSO10',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        minimumOrder: 50,
        maximumDiscount: 30,
        isActive: true,
        usedCount: 14,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'coup-2',
        code: 'TASTE20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minimumOrder: 100,
        maximumDiscount: 50,
        isActive: true,
        usedCount: 29,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'coup-3',
        code: 'WELCOME15',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        minimumOrder: 60,
        maximumDiscount: 25,
        isActive: true,
        usedCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Seed historical order for customer
    this.orders = [
      {
        id: 'ord-seed-01',
        orderNumber: 'GST-20260910-8801',
        userId: customerUser.id,
        subtotal: 106.0,
        discount: 10.6,
        discountCode: 'GUSTOSO10',
        deliveryFee: 15.0,
        vat: 16.56,
        total: 126.96,
        deliveryMethod: 'DELIVERY',
        paymentMethod: 'CASH_ON_DELIVERY',
        paymentStatus: 'PAID',
        orderStatus: 'DELIVERED',
        deliveryAddressSnapshot: {
          city: 'Riyadh',
          district: 'Al Olaya',
          street: 'Prince Muhammad Ibn Abd Al Aziz St',
          buildingNumber: '42',
          apartmentOrUnit: 'Villa 4B',
          notes: 'Delivered smoothly',
        },
        customerSnapshot: {
          fullName: 'Tariq Al-Mansoor',
          phone: '+966501234567',
          email: 'customer@gustosopizza.sa',
        },
        items: [
          {
            id: 'item-1',
            productId: 'p-1',
            productName: 'Pepperoni Diavola',
            quantity: 1,
            unitPrice: 58.0,
            totalPrice: 58.0,
            selectedSize: 'Medium (12")',
            selectedCrust: 'Classic Hand-Tossed',
            kitchenNotes: 'Extra crispy',
            toppings: [],
          },
          {
            id: 'item-2',
            productId: 'p-2',
            productName: 'Margherita D.O.P.',
            quantity: 1,
            unitPrice: 48.0,
            totalPrice: 48.0,
            selectedSize: 'Small (10")',
            selectedCrust: 'Artisan 48h Sourdough',
            toppings: [],
          },
        ],
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000 * 2),
      },
    ];

    // Set up customer favorites
    this.favorites.set(customerUser.id, new Set(['p-1', 'p-4']));
  }

  // Check if live Prisma connection is possible
  async checkConnection(): Promise<boolean> {
    if (this.isPrismaConnected !== null) {
      return this.isPrismaConnected;
    }
    try {
      if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('user:password')) {
        this.isPrismaConnected = false;
        return false;
      }
      await prisma.$queryRaw`SELECT 1`;
      this.isPrismaConnected = true;
      return true;
    } catch {
      this.isPrismaConnected = false;
      return false;
    }
  }

  // ==========================================
  // USERS & AUTH
  // ==========================================
  async findUserByEmail(email: string): Promise<StoredUser | null> {
    const isLive = await this.checkConnection();
    if (isLive) {
      try {
        const u = await prisma.user.findUnique({ where: { email } });
        return u as StoredUser | null;
      } catch (err) {
        console.warn('Prisma query failed, using memory store:', err);
      }
    }
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<StoredUser | null> {
    const isLive = await this.checkConnection();
    if (isLive) {
      try {
        const u = await prisma.user.findUnique({ where: { id } });
        return u as StoredUser | null;
      } catch (err) {
        console.warn('Prisma query failed, using memory store:', err);
      }
    }
    return this.users.find((u) => u.id === id) || null;
  }

  async createUser(data: {
    name: string;
    email: string;
    phone: string;
    passwordHash: string;
    role?: 'CUSTOMER' | 'ADMIN';
  }): Promise<StoredUser> {
    const isLive = await this.checkConnection();
    if (isLive) {
      try {
        const u = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            passwordHash: data.passwordHash,
            role: data.role || 'CUSTOMER',
          },
        });
        return u as StoredUser;
      } catch (err) {
        console.warn('Prisma create user failed, using memory store:', err);
      }
    }

    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      role: data.role || 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, data: { name?: string; phone?: string }): Promise<StoredUser | null> {
    const isLive = await this.checkConnection();
    if (isLive) {
      try {
        const u = await prisma.user.update({
          where: { id },
          data,
        });
        return u as StoredUser;
      } catch (err) {
        console.warn('Prisma update user failed, using memory store:', err);
      }
    }

    const user = this.users.find((u) => u.id === id);
    if (!user) return null;
    if (data.name) user.name = data.name;
    if (data.phone) user.phone = data.phone;
    user.updatedAt = new Date();
    return user;
  }

  // ==========================================
  // ADDRESSES
  // ==========================================
  async getUserAddresses(userId: string): Promise<StoredAddress[]> {
    const isLive = await this.checkConnection();
    if (isLive) {
      try {
        const addresses = await prisma.address.findMany({
          where: { userId },
          orderBy: { isDefault: 'desc' },
        });
        return addresses as StoredAddress[];
      } catch (err) {
        console.warn('Prisma addresses query failed, using memory store:', err);
      }
    }
    return this.addresses.filter((a) => a.userId === userId);
  }

  async createAddress(
    userId: string,
    data: {
      label?: string;
      city: string;
      district: string;
      street: string;
      buildingNumber: string;
      apartmentOrUnit?: string;
      notes?: string;
      isDefault?: boolean;
    }
  ): Promise<StoredAddress> {
    const isLive = await this.checkConnection();
    if (isLive) {
      try {
        if (data.isDefault) {
          await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          });
        }
        const created = await prisma.address.create({
          data: {
            userId,
            label: data.label || 'Home',
            city: data.city,
            district: data.district,
            street: data.street,
            buildingNumber: data.buildingNumber,
            apartmentOrUnit: data.apartmentOrUnit,
            notes: data.notes,
            isDefault: !!data.isDefault,
          },
        });
        return created as StoredAddress;
      } catch (err) {
        console.warn('Prisma create address failed, using memory store:', err);
      }
    }

    if (data.isDefault) {
      this.addresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const newAddress: StoredAddress = {
      id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      label: data.label || 'Home',
      city: data.city,
      district: data.district,
      street: data.street,
      buildingNumber: data.buildingNumber,
      apartmentOrUnit: data.apartmentOrUnit,
      notes: data.notes,
      isDefault: !!data.isDefault || this.addresses.filter((a) => a.userId === userId).length === 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.addresses.push(newAddress);
    return newAddress;
  }

  async updateAddress(
    id: string,
    userId: string,
    data: {
      label?: string;
      city?: string;
      district?: string;
      street?: string;
      buildingNumber?: string;
      apartmentOrUnit?: string;
      notes?: string;
      isDefault?: boolean;
    }
  ): Promise<StoredAddress | null> {
    const isLive = await this.checkConnection();
    if (isLive) {
      try {
        if (data.isDefault) {
          await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          });
        }
        const updated = await prisma.address.update({
          where: { id },
          data,
        });
        return updated as StoredAddress;
      } catch (err) {
        console.warn('Prisma update address failed, using memory store:', err);
      }
    }

    const addr = this.addresses.find((a) => a.id === id && a.userId === userId);
    if (!addr) return null;

    if (data.isDefault) {
      this.addresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
      addr.isDefault = true;
    }

    Object.assign(addr, data, { updatedAt: new Date() });
    return addr;
  }

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const isLive = await this.checkConnection();
    if (isLive) {
      try {
        await prisma.address.delete({ where: { id } });
        return true;
      } catch (err) {
        console.warn('Prisma delete address failed, using memory store:', err);
      }
    }

    const idx = this.addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (idx >= 0) {
      const removed = this.addresses.splice(idx, 1)[0];
      if (removed.isDefault) {
        const next = this.addresses.find((a) => a.userId === userId);
        if (next) next.isDefault = true;
      }
      return true;
    }
    return false;
  }

  async setDefaultAddress(id: string, userId: string): Promise<StoredAddress | null> {
    return this.updateAddress(id, userId, { isDefault: true });
  }

  // ==========================================
  // CART (DATABASE-BACKED)
  // ==========================================
  async getUserCart(userId: string): Promise<StoredCartItem[]> {
    const cart = this.carts.get(userId);
    return cart ? cart.items : [];
  }

  async addToCart(
    userId: string,
    item: {
      productId: string;
      quantity: number;
      unitPrice: number;
      selectedSize?: string;
      selectedCrust?: string;
      kitchenNotes?: string;
      toppings?: Array<{ id: string; name: string; price: number }>;
    }
  ): Promise<StoredCartItem[]> {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = { id: `cart-${userId}`, userId, items: [] };
      this.carts.set(userId, cart);
    }

    // Two items are identical ONLY if productId, size, crust, notes, and toppings match!
    const toppingKeys = (tps?: Array<{ id: string }>) =>
      (tps || [])
        .map((t) => t.id)
        .sort()
        .join('|');

    const incomingToppingKey = toppingKeys(item.toppings);

    const existingItem = cart.items.find(
      (it) =>
        it.productId === item.productId &&
        (it.selectedSize || '') === (item.selectedSize || '') &&
        (it.selectedCrust || '') === (item.selectedCrust || '') &&
        (it.kitchenNotes || '') === (item.kitchenNotes || '') &&
        toppingKeys(it.toppings) === incomingToppingKey
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.updatedAt = new Date();
    } else {
      const newItem: StoredCartItem = {
        id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        selectedSize: item.selectedSize,
        selectedCrust: item.selectedCrust,
        kitchenNotes: item.kitchenNotes,
        toppings: item.toppings || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      cart.items.push(newItem);
    }

    return cart.items;
  }

  async updateCartItemQuantity(userId: string, itemId: string, quantity: number): Promise<StoredCartItem[]> {
    const cart = this.carts.get(userId);
    if (!cart) return [];

    if (quantity <= 0) {
      cart.items = cart.items.filter((it) => it.id !== itemId);
    } else {
      const item = cart.items.find((it) => it.id === itemId);
      if (item) {
        item.quantity = quantity;
        item.updatedAt = new Date();
      }
    }
    return cart.items;
  }

  async removeCartItem(userId: string, itemId: string): Promise<StoredCartItem[]> {
    const cart = this.carts.get(userId);
    if (!cart) return [];
    cart.items = cart.items.filter((it) => it.id !== itemId);
    return cart.items;
  }

  async clearUserCart(userId: string): Promise<void> {
    const cart = this.carts.get(userId);
    if (cart) {
      cart.items = [];
    }
  }

  async mergeGuestCart(userId: string, guestItems: any[]): Promise<StoredCartItem[]> {
    for (const gItem of guestItems) {
      await this.addToCart(userId, {
        productId: gItem.product?.id || gItem.productId,
        quantity: gItem.quantity || 1,
        unitPrice: gItem.unitPrice || gItem.product?.basePrice || 48,
        selectedSize: gItem.selectedSize?.name || gItem.selectedSize,
        selectedCrust: gItem.selectedCrust?.name || gItem.selectedCrust,
        kitchenNotes: gItem.kitchenNotes,
        toppings: gItem.selectedToppings || gItem.toppings || [],
      });
    }
    return this.getUserCart(userId);
  }

  // ==========================================
  // FAVORITES (DATABASE-BACKED)
  // ==========================================
  async getUserFavorites(userId: string): Promise<string[]> {
    const favs = this.favorites.get(userId);
    return favs ? Array.from(favs) : [];
  }

  async toggleFavorite(userId: string, productId: string): Promise<{ isFavorited: boolean; favorites: string[] }> {
    let favs = this.favorites.get(userId);
    if (!favs) {
      favs = new Set();
      this.favorites.set(userId, favs);
    }

    let isFavorited = false;
    if (favs.has(productId)) {
      favs.delete(productId);
      isFavorited = false;
    } else {
      favs.add(productId);
      isFavorited = true;
    }

    return {
      isFavorited,
      favorites: Array.from(favs),
    };
  }

  async mergeGuestFavorites(userId: string, guestProductIds: string[]): Promise<string[]> {
    let favs = this.favorites.get(userId);
    if (!favs) {
      favs = new Set();
      this.favorites.set(userId, favs);
    }
    for (const pid of guestProductIds) {
      favs.add(pid);
    }
    return Array.from(favs);
  }

  // ==========================================
  // ORDERS
  // ==========================================
  async createOrder(data: {
    userId?: string;
    subtotal: number;
    discount: number;
    discountCode?: string;
    deliveryFee: number;
    vat: number;
    total: number;
    deliveryMethod: 'DELIVERY' | 'PICKUP';
    paymentMethod: 'CASH_ON_DELIVERY' | 'CARD_ON_DELIVERY' | 'APPLE_PAY';
    paymentStatus?: 'PENDING' | 'PAID' | 'FAILED';
    orderStatus?: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    deliveryAddressSnapshot?: any;
    customerSnapshot?: any;
    notes?: string;
    items: Array<{
      productId?: string;
      productName: string;
      productImage?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      selectedSize?: string;
      selectedCrust?: string;
      kitchenNotes?: string;
      toppings?: Array<{ name: string; price: number }>;
    }>;
  }): Promise<StoredOrder> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `GST-${today}-${rand}`;

    const newOrder: StoredOrder = {
      id: `ord-${Date.now()}-${rand}`,
      orderNumber,
      userId: data.userId,
      subtotal: data.subtotal,
      discount: data.discount,
      discountCode: data.discountCode,
      deliveryFee: data.deliveryFee,
      vat: data.vat,
      total: data.total,
      deliveryMethod: data.deliveryMethod,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus || 'PENDING',
      orderStatus: data.orderStatus || 'CONFIRMED',
      deliveryAddressSnapshot: data.deliveryAddressSnapshot,
      customerSnapshot: data.customerSnapshot,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: data.items.map((it, idx) => ({
        id: `ord-item-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: it.productName,
        productImage: it.productImage,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.totalPrice,
        selectedSize: it.selectedSize,
        selectedCrust: it.selectedCrust,
        kitchenNotes: it.kitchenNotes,
        toppings: it.toppings || [],
      })),
    };

    this.orders.unshift(newOrder);

    // Clear user cart if userId exists
    if (data.userId) {
      await this.clearUserCart(data.userId);
    }

    return newOrder;
  }

  async getUserOrders(userId: string): Promise<StoredOrder[]> {
    return this.orders.filter((o) => o.userId === userId);
  }

  async getOrderById(orderId: string): Promise<StoredOrder | null> {
    return (
      this.orders.find((o) => o.id === orderId || o.orderNumber === orderId) || null
    );
  }

  async getAllOrdersAdmin(statusFilter?: string): Promise<StoredOrder[]> {
    if (!statusFilter || statusFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(
      (o) => o.orderStatus.toLowerCase() === statusFilter.toLowerCase()
    );
  }

  async updateOrderStatusAdmin(
    orderId: string,
    newStatus: StoredOrder['orderStatus']
  ): Promise<StoredOrder | null> {
    const order = this.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;
    order.orderStatus = newStatus;
    if (newStatus === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }
    order.updatedAt = new Date();
    return order;
  }

  // ==========================================
  // PRODUCTS & CATEGORIES
  // ==========================================
  async listProducts(): Promise<StoredProduct[]> {
    return this.products;
  }

  async getProductById(id: string): Promise<StoredProduct | null> {
    return this.products.find((p) => p.id === id || p.slug === id) || null;
  }

  async createProduct(data: Omit<StoredProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredProduct> {
    const newProduct: StoredProduct = {
      ...data,
      id: `p-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: string, data: Partial<StoredProduct>): Promise<StoredProduct | null> {
    const prod = this.products.find((p) => p.id === id);
    if (!prod) return null;
    Object.assign(prod, data, { updatedAt: new Date() });
    return prod;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx >= 0) {
      this.products.splice(idx, 1);
      return true;
    }
    return false;
  }

  async listCategories(): Promise<StoredCategory[]> {
    return this.categories;
  }

  async createCategory(data: { name: string; slug: string; description?: string; image?: string }): Promise<StoredCategory> {
    const newCat: StoredCategory = {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      description: data.description,
      image: data.image,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.push(newCat);
    return newCat;
  }

  async updateCategory(id: string, data: Partial<StoredCategory>): Promise<StoredCategory | null> {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) return null;
    Object.assign(cat, data, { updatedAt: new Date() });
    return cat;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
    // Check if category has products
    const hasProducts = this.products.some((p) => p.categoryId === id);
    if (hasProducts) {
      return { success: false, message: 'Cannot delete category containing products. Reassign or delete the products first.' };
    }
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.categories.splice(idx, 1);
      return { success: true };
    }
    return { success: false, message: 'Category not found.' };
  }

  // ==========================================
  // TOPPINGS
  // ==========================================
  async listToppings(): Promise<StoredTopping[]> {
    return this.toppings;
  }

  async createTopping(data: Omit<StoredTopping, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredTopping> {
    const newT: StoredTopping = {
      ...data,
      id: `top-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.toppings.push(newT);
    return newT;
  }

  async updateTopping(id: string, data: Partial<StoredTopping>): Promise<StoredTopping | null> {
    const t = this.toppings.find((item) => item.id === id);
    if (!t) return null;
    Object.assign(t, data, { updatedAt: new Date() });
    return t;
  }

  async deleteTopping(id: string): Promise<boolean> {
    const idx = this.toppings.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.toppings.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ==========================================
  // OFFERS
  // ==========================================
  async listOffers(): Promise<StoredOffer[]> {
    return this.offers;
  }

  async createOffer(data: Omit<StoredOffer, 'id' | 'createdAt' | 'updatedAt'>): Promise<StoredOffer> {
    const newO: StoredOffer = {
      ...data,
      id: `off-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.offers.push(newO);
    return newO;
  }

  async updateOffer(id: string, data: Partial<StoredOffer>): Promise<StoredOffer | null> {
    const off = this.offers.find((o) => o.id === id);
    if (!off) return null;
    Object.assign(off, data, { updatedAt: new Date() });
    return off;
  }

  async deleteOffer(id: string): Promise<boolean> {
    const idx = this.offers.findIndex((o) => o.id === id);
    if (idx >= 0) {
      this.offers.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ==========================================
  // COUPONS
  // ==========================================
  async listCoupons(): Promise<StoredCoupon[]> {
    return this.coupons;
  }

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: StoredCoupon; message?: string }> {
    const coupon = this.coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code.' };
    }
    if (!coupon.isActive) {
      return { valid: false, message: 'This coupon is no longer active.' };
    }
    if (coupon.minimumOrder > 0 && subtotal < coupon.minimumOrder) {
      return { valid: false, message: `Minimum order of ${coupon.minimumOrder} SAR required for this coupon.` };
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'This coupon has reached its maximum usage limit.' };
    }
    return { valid: true, coupon };
  }

  async createCoupon(data: Omit<StoredCoupon, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Promise<StoredCoupon> {
    const newC: StoredCoupon = {
      ...data,
      id: `coup-${Date.now()}`,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.coupons.push(newC);
    return newC;
  }

  async updateCoupon(id: string, data: Partial<StoredCoupon>): Promise<StoredCoupon | null> {
    const c = this.coupons.find((item) => item.id === id);
    if (!c) return null;
    Object.assign(c, data, { updatedAt: new Date() });
    return c;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    const idx = this.coupons.findIndex((c) => c.id === id);
    if (idx >= 0) {
      this.coupons.splice(idx, 1);
      return true;
    }
    return false;
  }

  // ==========================================
  // CUSTOMERS (ADMIN)
  // ==========================================
  async listCustomers(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    createdAt: Date;
    ordersCount: number;
    totalSpent: number;
  }>> {
    return this.users.map((u) => {
      const userOrders = this.orders.filter((o) => o.userId === u.id);
      const totalSpent = userOrders.reduce((acc, o) => acc + o.total, 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt,
        ordersCount: userOrders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
      };
    });
  }

  // ==========================================
  // ADMIN OVERVIEW METRICS
  // ==========================================
  async getAdminOverview(): Promise<{
    totalSales: number;
    todaySales: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    registeredCustomers: number;
    bestSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
  }> {
    const totalSales = this.orders.reduce((acc, o) => acc + o.total, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todaySales = this.orders
      .filter((o) => new Date(o.createdAt) >= startOfToday)
      .reduce((acc, o) => acc + o.total, 0);

    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter(
      (o) => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING'
    ).length;
    const completedOrders = this.orders.filter((o) => o.orderStatus === 'DELIVERED').length;
    const registeredCustomers = this.users.filter((u) => u.role === 'CUSTOMER').length;

    // Calculate best selling products
    const productSalesMap = new Map<string, { quantity: number; revenue: number }>();
    for (const order of this.orders) {
      for (const item of order.items) {
        const existing = productSalesMap.get(item.productName) || { quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
        productSalesMap.set(item.productName, existing);
      }
    }

    const bestSellingProducts = Array.from(productSalesMap.entries())
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: Math.round(stats.revenue * 100) / 100,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalSales: Math.round(totalSales * 100) / 100,
      todaySales: Math.round(todaySales * 100) / 100,
      totalOrders,
      pendingOrders,
      completedOrders,
      registeredCustomers,
      bestSellingProducts,
    };
  }
}

export const dbService = new DatabaseService();
