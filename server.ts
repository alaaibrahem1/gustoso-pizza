import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbService } from './src/server/db';
import {
  hashPassword,
  comparePassword,
  signToken,
  requireAuth,
  requireAdmin,
  optionalAuth,
  AuthenticatedRequest,
} from './src/server/auth';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ============================================================
  // 1. AUTHENTICATION ENDPOINTS
  // ============================================================

  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      // Validation
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      // Check existing user
      const existingUser = await dbService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      // Hash password & create user
      const passwordHash = await hashPassword(password);
      const user = await dbService.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        passwordHash,
        role: 'CUSTOMER',
      });

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      // Never return passwordHash to frontend
      const { passwordHash: _, ...safeUser } = user;

      res.status(201).json({
        message: 'Account registered successfully',
        token,
        user: safeUser,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await dbService.findUserByEmail(email.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      const { passwordHash: _, ...safeUser } = user;

      res.json({
        message: 'Login successful',
        token,
        user: safeUser,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed. Please try again.' });
    }
  });

  // Me (current authenticated user profile)
  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await dbService.findUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const { passwordHash: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      console.error('Fetch user error:', error);
      res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
  });

  // Profile update
  app.put('/api/auth/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, phone } = req.body;
      const updated = await dbService.updateUser(req.user!.id, { name, phone });
      if (!updated) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const { passwordHash: _, ...safeUser } = updated;
      res.json({ message: 'Profile updated', user: safeUser });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  });

  // ============================================================
  // 2. SAVED ADDRESSES (CRUD + Default)
  // ============================================================
  app.get('/api/addresses', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const addresses = await dbService.getUserAddresses(req.user!.id);
      res.json(addresses);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch addresses.' });
    }
  });

  app.post('/api/addresses', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { label, city, district, street, buildingNumber, apartmentOrUnit, notes, isDefault } = req.body;
      if (!city || !district || !street || !buildingNumber) {
        return res.status(400).json({ error: 'City, district, street, and building number are required.' });
      }

      const address = await dbService.createAddress(req.user!.id, {
        label,
        city,
        district,
        street,
        buildingNumber,
        apartmentOrUnit,
        notes,
        isDefault,
      });
      res.status(201).json(address);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create address.' });
    }
  });

  app.put('/api/addresses/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const updated = await dbService.updateAddress(req.params.id, req.user!.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Address not found or unauthorized.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update address.' });
    }
  });

  app.delete('/api/addresses/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await dbService.deleteAddress(req.params.id, req.user!.id);
      if (!success) {
        return res.status(404).json({ error: 'Address not found or unauthorized.' });
      }
      res.json({ message: 'Address deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete address.' });
    }
  });

  app.patch('/api/addresses/:id/default', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const updated = await dbService.setDefaultAddress(req.params.id, req.user!.id);
      if (!updated) {
        return res.status(404).json({ error: 'Address not found.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to set default address.' });
    }
  });

  // ============================================================
  // 3. DATABASE-BACKED CART & GUEST MIGRATION
  // ============================================================
  app.get('/api/cart', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const items = await dbService.getUserCart(req.user!.id);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch cart.' });
    }
  });

  app.post('/api/cart/items', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { productId, quantity, unitPrice, selectedSize, selectedCrust, kitchenNotes, toppings } = req.body;
      if (!productId || !quantity || !unitPrice) {
        return res.status(400).json({ error: 'Product ID, quantity, and unit price are required.' });
      }

      const items = await dbService.addToCart(req.user!.id, {
        productId,
        quantity,
        unitPrice,
        selectedSize,
        selectedCrust,
        kitchenNotes,
        toppings,
      });
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to add item to cart.' });
    }
  });

  app.put('/api/cart/items/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { quantity } = req.body;
      const items = await dbService.updateCartItemQuantity(req.user!.id, req.params.id, quantity);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update cart item.' });
    }
  });

  app.delete('/api/cart/items/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const items = await dbService.removeCartItem(req.user!.id, req.params.id);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to remove cart item.' });
    }
  });

  app.delete('/api/cart', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      await dbService.clearUserCart(req.user!.id);
      res.json({ message: 'Cart cleared.' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to clear cart.' });
    }
  });

  // Merge guest cart upon customer login
  app.post('/api/cart/merge', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { guestItems } = req.body;
      if (!Array.isArray(guestItems)) {
        return res.status(400).json({ error: 'guestItems must be an array.' });
      }
      const cart = await dbService.mergeGuestCart(req.user!.id, guestItems);
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to merge guest cart.' });
    }
  });

  // ============================================================
  // 4. DATABASE-BACKED FAVORITES
  // ============================================================
  app.get('/api/favorites', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const favorites = await dbService.getUserFavorites(req.user!.id);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch favorites.' });
    }
  });

  app.post('/api/favorites/toggle', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'productId is required.' });
      }
      const result = await dbService.toggleFavorite(req.user!.id, productId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to toggle favorite.' });
    }
  });

  app.post('/api/favorites/merge', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { guestFavorites } = req.body;
      if (!Array.isArray(guestFavorites)) {
        return res.status(400).json({ error: 'guestFavorites must be an array.' });
      }
      const favs = await dbService.mergeGuestFavorites(req.user!.id, guestFavorites);
      res.json(favs);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to merge guest favorites.' });
    }
  });

  // ============================================================
  // 5. ORDERS & CHECKOUT
  // ============================================================
  app.post('/api/orders', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const {
        subtotal,
        discount,
        discountCode,
        deliveryFee,
        vat,
        total,
        deliveryMethod,
        paymentMethod,
        deliveryAddressSnapshot,
        customerSnapshot,
        notes,
        items,
      } = req.body;

      if (!items || !items.length || total === undefined) {
        return res.status(400).json({ error: 'Order must contain items and a total amount.' });
      }

      const order = await dbService.createOrder({
        userId: req.user ? req.user.id : undefined,
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        discountCode,
        deliveryFee: Number(deliveryFee) || 0,
        vat: Number(vat) || 0,
        total: Number(total) || 0,
        deliveryMethod: deliveryMethod === 'pickup' ? 'PICKUP' : 'DELIVERY',
        paymentMethod:
          paymentMethod === 'apple_pay'
            ? 'APPLE_PAY'
            : paymentMethod === 'card_on_delivery'
            ? 'CARD_ON_DELIVERY'
            : 'CASH_ON_DELIVERY',
        paymentStatus: paymentMethod === 'apple_pay' ? 'PAID' : 'PENDING',
        orderStatus: 'CONFIRMED',
        deliveryAddressSnapshot,
        customerSnapshot,
        notes,
        items,
      });

      res.status(201).json(order);
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order.' });
    }
  });

  // Customer order history
  app.get('/api/orders', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const orders = await dbService.getUserOrders(req.user!.id);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch orders.' });
    }
  });

  // Customer order detail with IDOR protection
  app.get('/api/orders/:id', optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const order = await dbService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      // If the order belongs to a user, only allow that user or an admin
      if (order.userId) {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required to view this order.' });
        }
        if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Forbidden: You do not have permission to view this order.' });
        }
      }

      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch order.' });
    }
  });

  // ============================================================
  // 6. PUBLIC MENU ENDPOINTS
  // ============================================================
  app.get('/api/products', async (_req, res) => {
    try {
      const products = await dbService.listProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch products.' });
    }
  });

  app.get('/api/categories', async (_req, res) => {
    try {
      const categories = await dbService.listCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch categories.' });
    }
  });

  app.get('/api/toppings', async (_req, res) => {
    try {
      const toppings = await dbService.listToppings();
      res.json(toppings);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch toppings.' });
    }
  });

  app.get('/api/offers', async (_req, res) => {
    try {
      const offers = await dbService.listOffers();
      res.json(offers);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch offers.' });
    }
  });

  app.get('/api/coupons', async (_req, res) => {
    try {
      const coupons = await dbService.listCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch coupons.' });
    }
  });

  app.post('/api/coupons/validate', async (req, res) => {
    try {
      const { code, subtotal } = req.body;
      if (!code) {
        return res.status(400).json({ valid: false, message: 'Coupon code is required.' });
      }
      const result = await dbService.validateCoupon(code, Number(subtotal) || 0);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ valid: false, message: 'Failed to validate coupon.' });
    }
  });

  // ============================================================
  // 7. ADMIN ENDPOINTS (Require requireAdmin)
  // ============================================================

  // Overview metrics
  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      const stats = await dbService.getAdminOverview();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch overview metrics.' });
    }
  });

  // Admin Orders
  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
      const statusFilter = req.query.status as string;
      const orders = await dbService.getAllOrdersAdmin(statusFilter);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch admin orders.' });
    }
  });

  app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const updated = await dbService.updateOrderStatusAdmin(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Order not found.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update order status.' });
    }
  });

  // Admin Products
  app.get('/api/admin/products', requireAdmin, async (_req, res) => {
    try {
      const products = await dbService.listProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch products.' });
    }
  });

  app.post('/api/admin/products', requireAdmin, async (req, res) => {
    try {
      const { name, slug, description, image, categoryId, basePrice, rating, isPopular, isFeatured, isAvailable } = req.body;
      if (!name || !slug || !basePrice || !categoryId) {
        return res.status(400).json({ error: 'Name, slug, category, and base price are required.' });
      }

      const product = await dbService.createProduct({
        name,
        slug,
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
        categoryId,
        basePrice: Number(basePrice),
        rating: Number(rating) || 4.9,
        isPopular: !!isPopular,
        isFeatured: !!isFeatured,
        isAvailable: isAvailable !== undefined ? !!isAvailable : true,
      });
      res.status(201).json(product);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create product.' });
    }
  });

  app.put('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await dbService.updateProduct(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update product.' });
    }
  });

  app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const success = await dbService.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Product not found.' });
      }
      res.json({ message: 'Product deleted.' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete product.' });
    }
  });

  // Admin Categories
  app.get('/api/admin/categories', requireAdmin, async (_req, res) => {
    try {
      const cats = await dbService.listCategories();
      res.json(cats);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch categories.' });
    }
  });

  app.post('/api/admin/categories', requireAdmin, async (req, res) => {
    try {
      const { name, slug, description, image } = req.body;
      if (!name || !slug) {
        return res.status(400).json({ error: 'Name and slug are required.' });
      }
      const cat = await dbService.createCategory({ name, slug, description, image });
      res.status(201).json(cat);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create category.' });
    }
  });

  app.put('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await dbService.updateCategory(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Category not found.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update category.' });
    }
  });

  app.delete('/api/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const result = await dbService.deleteCategory(req.params.id);
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }
      res.json({ message: 'Category deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete category.' });
    }
  });

  // Admin Toppings
  app.get('/api/admin/toppings', requireAdmin, async (_req, res) => {
    try {
      const toppings = await dbService.listToppings();
      res.json(toppings);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch toppings.' });
    }
  });

  app.post('/api/admin/toppings', requireAdmin, async (req, res) => {
    try {
      const { name, category, price, isAvailable } = req.body;
      if (!name || !category || price === undefined) {
        return res.status(400).json({ error: 'Name, category, and price are required.' });
      }
      const topping = await dbService.createTopping({
        name,
        category,
        price: Number(price),
        isAvailable: isAvailable !== undefined ? !!isAvailable : true,
      });
      res.status(201).json(topping);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create topping.' });
    }
  });

  app.put('/api/admin/toppings/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await dbService.updateTopping(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Topping not found.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update topping.' });
    }
  });

  app.delete('/api/admin/toppings/:id', requireAdmin, async (req, res) => {
    try {
      const success = await dbService.deleteTopping(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Topping not found.' });
      }
      res.json({ message: 'Topping deleted.' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete topping.' });
    }
  });

  // Admin Offers
  app.get('/api/admin/offers', requireAdmin, async (_req, res) => {
    try {
      const offers = await dbService.listOffers();
      res.json(offers);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch offers.' });
    }
  });

  app.post('/api/admin/offers', requireAdmin, async (req, res) => {
    try {
      const { name, slug, description, image, originalPrice, discountedPrice, discountPercentage, isActive } = req.body;
      if (!name || !slug || originalPrice === undefined || discountedPrice === undefined) {
        return res.status(400).json({ error: 'Name, slug, and prices are required.' });
      }
      const offer = await dbService.createOffer({
        name,
        slug,
        description: description || '',
        image: image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900',
        originalPrice: Number(originalPrice),
        discountedPrice: Number(discountedPrice),
        discountPercentage: Number(discountPercentage) || Math.round((1 - discountedPrice / originalPrice) * 100),
        isActive: isActive !== undefined ? !!isActive : true,
      });
      res.status(201).json(offer);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create offer.' });
    }
  });

  app.put('/api/admin/offers/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await dbService.updateOffer(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Offer not found.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update offer.' });
    }
  });

  app.delete('/api/admin/offers/:id', requireAdmin, async (req, res) => {
    try {
      const success = await dbService.deleteOffer(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Offer not found.' });
      }
      res.json({ message: 'Offer deleted.' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete offer.' });
    }
  });

  // Admin Coupons
  app.get('/api/admin/coupons', requireAdmin, async (_req, res) => {
    try {
      const coupons = await dbService.listCoupons();
      res.json(coupons);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch coupons.' });
    }
  });

  app.post('/api/admin/coupons', requireAdmin, async (req, res) => {
    try {
      const { code, discountType, discountValue, minimumOrder, maximumDiscount, usageLimit, isActive } = req.body;
      if (!code || !discountType || discountValue === undefined) {
        return res.status(400).json({ error: 'Code, discountType, and discountValue are required.' });
      }
      const coupon = await dbService.createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minimumOrder: Number(minimumOrder) || 0,
        maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        isActive: isActive !== undefined ? !!isActive : true,
      });
      res.status(201).json(coupon);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create coupon.' });
    }
  });

  app.put('/api/admin/coupons/:id', requireAdmin, async (req, res) => {
    try {
      const updated = await dbService.updateCoupon(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Coupon not found.' });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update coupon.' });
    }
  });

  app.delete('/api/admin/coupons/:id', requireAdmin, async (req, res) => {
    try {
      const success = await dbService.deleteCoupon(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Coupon not found.' });
      }
      res.json({ message: 'Coupon deleted.' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete coupon.' });
    }
  });

  // Admin Customers
  app.get('/api/admin/customers', requireAdmin, async (_req, res) => {
    try {
      const customers = await dbService.listCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch customers.' });
    }
  });

  // ============================================================
  // 8. VITE MIDDLEWARE / STATIC ASSETS
  // ============================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🍕 Gustoso Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
