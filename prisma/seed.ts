/**
 * Database Seed Script for Gustoso Pizza KSA
 * Populates categories, products, toppings, offers, coupons, and demo users.
 * Run with: npx tsx prisma/seed.ts
 */

import { PrismaClient, Role, ToppingCategory, DiscountType, DeliveryMethod, PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Demo Admin User (DEVELOPMENT ONLY)
  const adminPasswordHash = await bcrypt.hash('Admin123!*', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gustosopizza.sa' },
    update: {},
    create: {
      name: 'Gustoso Operations Admin',
      email: 'admin@gustosopizza.sa',
      phone: '+966500000000',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Demo Admin User created: admin@gustosopizza.sa (DEVELOPMENT ONLY: Admin123!*)');

  // 2. Seed Demo Customer User
  const customerPasswordHash = await bcrypt.hash('Customer123!*', 10);
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@gustosopizza.sa' },
    update: {},
    create: {
      name: 'Tariq Al-Mansoor',
      email: 'customer@gustosopizza.sa',
      phone: '+966501234567',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      addresses: {
        create: [
          {
            label: 'Home',
            city: 'Riyadh',
            district: 'Al Olaya',
            street: 'Prince Muhammad Ibn Abd Al Aziz St',
            buildingNumber: '42',
            apartmentOrUnit: 'Villa 4B',
            notes: 'Gate buzzer 4402',
            isDefault: true,
          },
          {
            label: 'Work',
            city: 'Riyadh',
            district: 'King Abdullah Financial District (KAFD)',
            street: 'Tower 3, Floor 14',
            buildingNumber: '10',
            apartmentOrUnit: 'Suite 1402',
            notes: 'Leave with front desk reception',
            isDefault: false,
          },
        ],
      },
    },
  });
  console.log('✅ Demo Customer created: customer@gustosopizza.sa (Pass: Customer123!*)');

  // 3. Seed Categories
  const categoriesData = [
    { name: 'Pizza', slug: 'pizza', description: 'Handcrafted 48h Fermented Stone Oven Pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600' },
    { name: 'Sides', slug: 'sides', description: 'Crispy Truffle Fries, Mozzarella Sticks & Artisan Garlic Bread', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600' },
    { name: 'Wings', slug: 'wings', description: 'Jumbo Crisp Buffalo, BBQ & Herb Glazed Wings', image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600' },
    { name: 'Sauces', slug: 'sauces', description: 'Signature Truffle Aioli, Calabrian Hot Honey & Herbed Ranch', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=600' },
    { name: 'Drinks', slug: 'drinks', description: 'San Pellegrino Sparkling Sodas & Chilled Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600' },
    { name: 'Desserts', slug: 'desserts', description: 'Warm Nutella Calzones & Crisp Sicilian Cannoli', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600' },
    { name: 'Deals', slug: 'deals', description: 'Chef Family Bundles & Value Combos', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600' },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: cat.image },
      create: cat,
    });
    categoryMap.set(cat.slug, created.id);
  }
  console.log(`✅ Seeded ${categoriesData.length} categories.`);

  // 4. Seed Toppings
  const toppingsData = [
    { name: 'Extra Fior di Latte', category: ToppingCategory.CHEESE, price: 8.0 },
    { name: 'Aged Gorgonzola', category: ToppingCategory.CHEESE, price: 9.0 },
    { name: 'Shaved Parmigiano Reggiano', category: ToppingCategory.CHEESE, price: 7.0 },
    { name: 'Fresh Creamy Burrata', category: ToppingCategory.CHEESE, price: 14.0 },
    { name: 'Crispy Pepperoni Cups', category: ToppingCategory.MEAT, price: 9.0 },
    { name: 'Smoked Grilled Chicken', category: ToppingCategory.MEAT, price: 10.0 },
    { name: 'Fennel Italian Sausage', category: ToppingCategory.MEAT, price: 9.0 },
    { name: 'Crispy Beef Bacon', category: ToppingCategory.MEAT, price: 10.0 },
    { name: 'Halal Cured Beef Cecina', category: ToppingCategory.MEAT, price: 12.0 },
    { name: 'Roasted Portobello Mushrooms', category: ToppingCategory.VEGETABLES, price: 6.0 },
    { name: 'Kalamata Black Olives', category: ToppingCategory.VEGETABLES, price: 5.0 },
    { name: 'Fire-Pickled Jalapeños', category: ToppingCategory.VEGETABLES, price: 5.0 },
    { name: 'Caramelized Sweet Onions', category: ToppingCategory.VEGETABLES, price: 5.0 },
    { name: 'Fresh Genovese Basil', category: ToppingCategory.VEGETABLES, price: 4.0 },
    { name: 'Blistered Cherry Tomatoes', category: ToppingCategory.VEGETABLES, price: 5.0 },
    { name: 'Spicy Chili Hot Honey', category: ToppingCategory.SAUCES, price: 5.0 },
    { name: 'White Truffle Infused Oil', category: ToppingCategory.SAUCES, price: 8.0 },
    { name: 'Creamy Garlic Parmesan Drizzle', category: ToppingCategory.SAUCES, price: 4.0 },
  ];

  for (const t of toppingsData) {
    await prisma.topping.create({
      data: t,
    });
  }
  console.log(`✅ Seeded ${toppingsData.length} toppings.`);

  // 5. Seed Products
  const productsData = [
    {
      name: 'Pepperoni Diavola',
      slug: 'pepperoni-diavola',
      description: 'Double artisanal pepperoni cups that crisp into oil pools, San Marzano tomato sauce, fresh mozzarella, and hot honey.',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900&auto=format&fit=crop&q=80',
      categorySlug: 'pizza',
      basePrice: 58.0,
      rating: 4.9,
      isPopular: true,
      isFeatured: true,
    },
    {
      name: 'Margherita D.O.P.',
      slug: 'margherita-dop',
      description: 'The timeless Neapolitan classic with crushed San Marzano tomatoes, fresh Buffalo mozzarella, extra virgin olive oil, and sweet basil leaves.',
      image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=900&auto=format&fit=crop&q=80',
      categorySlug: 'pizza',
      basePrice: 48.0,
      rating: 4.8,
      isPopular: true,
      isFeatured: false,
    },
    {
      name: 'Truffle Wild Mushroom',
      slug: 'truffle-wild-mushroom',
      description: 'Roasted cremini & portobello mushrooms, thyme-infused ricotta, smoked fior di latte, topped with shaved parmesan and white truffle oil.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&auto=format&fit=crop&q=80',
      categorySlug: 'pizza',
      basePrice: 68.0,
      rating: 4.9,
      isPopular: true,
      isFeatured: true,
    },
    {
      name: 'Quattro Formaggi Cremosa',
      slug: 'quattro-formaggi-cremosa',
      description: 'Four Italian cheeses: Fior di latte mozzarella, creamy gorgonzola dolce, aged fontina, and 24-month parmigiano reggiano with rosemary.',
      image: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=900&auto=format&fit=crop&q=80',
      categorySlug: 'pizza',
      basePrice: 64.0,
      rating: 4.7,
      isPopular: false,
      isFeatured: false,
    },
    {
      name: 'Burrata e Pesto Genovese',
      slug: 'burrata-pesto-genovese',
      description: 'Whole 125g fresh creamy burrata ball placed warm upon blistered crust with house pine nut basil pesto and roasted cherry tomatoes.',
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=900&auto=format&fit=crop&q=80',
      categorySlug: 'pizza',
      basePrice: 72.0,
      rating: 5.0,
      isPopular: true,
      isFeatured: true,
    },
    {
      name: 'Smoked BBQ Pollo & Bacon',
      slug: 'smoked-bbq-pollo-bacon',
      description: 'Wood-smoked chicken breast, crispy beef bacon crumbles, tangy smoky BBQ reduction, caramelized sweet onions, and smoked scamorza.',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&auto=format&fit=crop&q=80',
      categorySlug: 'pizza',
      basePrice: 62.0,
      rating: 4.8,
      isPopular: true,
      isFeatured: false,
    },
    // Sides
    {
      name: 'Loaded Truffle Curly Fries',
      slug: 'loaded-truffle-curly-fries',
      description: 'Seasoned spiral fries tossed in white truffle oil, fresh rosemary, and grated parmesan.',
      image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'sides',
      basePrice: 24.0,
      rating: 4.8,
      isPopular: true,
      isFeatured: false,
    },
    {
      name: 'Golden Mozzarella Sticks (6 pcs)',
      slug: 'golden-mozzarella-sticks',
      description: 'Melty fior di latte mozzarella in Italian herb breading, served with warm marinara.',
      image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'sides',
      basePrice: 26.0,
      rating: 4.7,
      isPopular: true,
      isFeatured: false,
    },
    // Wings
    {
      name: 'Buffalo Glazed Jumbo Wings (6 pcs)',
      slug: 'buffalo-glazed-jumbo-wings',
      description: 'Crispy fried jumbo wings drenched in spicy tangy cayenne butter glaze with blue cheese dip.',
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'wings',
      basePrice: 34.0,
      rating: 4.9,
      isPopular: true,
      isFeatured: true,
    },
    // Drinks
    {
      name: 'San Pellegrino Aranciata Rossa',
      slug: 'san-pellegrino-aranciata-rossa',
      description: 'Sparkling Italian mineral soda with Mediterranean blood orange in a glass bottle (330ml).',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'drinks',
      basePrice: 14.0,
      rating: 4.8,
      isPopular: false,
      isFeatured: false,
    },
    // Desserts
    {
      name: 'Warm Nutella Stuffed Calzone',
      slug: 'warm-nutella-stuffed-calzone',
      description: 'Oven-baked blistered dough stuffed with melted Ferrero Nutella and sweet mascarpone.',
      image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
      categorySlug: 'desserts',
      basePrice: 36.0,
      rating: 4.9,
      isPopular: true,
      isFeatured: false,
    },
  ];

  for (const p of productsData) {
    const categoryId = categoryMap.get(p.categorySlug) || categoryMap.get('pizza')!;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        image: p.image,
        categoryId,
        basePrice: p.basePrice,
        rating: p.rating,
        isPopular: p.isPopular,
        isFeatured: p.isFeatured,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        image: p.image,
        categoryId,
        basePrice: p.basePrice,
        rating: p.rating,
        isPopular: p.isPopular,
        isFeatured: p.isFeatured,
      },
    });
  }
  console.log(`✅ Seeded ${productsData.length} products.`);

  // 6. Seed Offers
  await prisma.offer.upsert({
    where: { slug: 'family-feast-bundle' },
    update: {},
    create: {
      name: 'Family Feast Feast Combo',
      slug: 'family-feast-bundle',
      description: 'Any 2 Large Artisan Pizzas + Truffle Curly Fries + 6 Jumbo Buffalo Wings + 1.25L Soda.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
      originalPrice: 165.0,
      discountedPrice: 129.0,
      discountPercentage: 22,
      isActive: true,
    },
  });

  await prisma.offer.upsert({
    where: { slug: 'duo-pizza-deal' },
    update: {},
    create: {
      name: 'Duo Pizza Supreme',
      slug: 'duo-pizza-deal',
      description: 'Any 2 Medium Specialty Pizzas of your choice at a special bundled price.',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=900',
      originalPrice: 126.0,
      discountedPrice: 99.0,
      discountPercentage: 21,
      isActive: true,
    },
  });
  console.log('✅ Seeded special offers.');

  // 7. Seed Coupons
  const couponsData = [
    {
      code: 'GUSTOSO10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minimumOrder: 50,
      maximumDiscount: 30,
      isActive: true,
    },
    {
      code: 'TASTE20',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 20,
      minimumOrder: 100,
      maximumDiscount: 50,
      isActive: true,
    },
    {
      code: 'WELCOME15',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 15,
      minimumOrder: 60,
      maximumDiscount: 25,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }
  console.log(`✅ Seeded ${couponsData.length} coupons.`);

  // 8. Seed Initial Sample Orders for customer
  const existingOrders = await prisma.order.findMany();
  if (existingOrders.length === 0) {
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: 'GST-20260910-8801',
        userId: customerUser.id,
        subtotal: 106.0,
        discount: 10.6,
        discountCode: 'GUSTOSO10',
        deliveryFee: 15.0,
        vat: 16.56,
        total: 126.96,
        deliveryMethod: DeliveryMethod.DELIVERY,
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.DELIVERED,
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
        items: {
          create: [
            {
              productName: 'Pepperoni Diavola',
              quantity: 1,
              unitPrice: 58.0,
              totalPrice: 58.0,
              selectedSize: 'Medium (12")',
              selectedCrust: 'Classic Hand-Tossed',
              kitchenNotes: 'Extra crispy',
            },
            {
              productName: 'Margherita D.O.P.',
              quantity: 1,
              unitPrice: 48.0,
              totalPrice: 48.0,
              selectedSize: 'Small (10")',
              selectedCrust: 'Artisan 48h Sourdough',
            },
          ],
        },
      },
    });
    console.log('✅ Created historical seed order:', sampleOrder.orderNumber);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
