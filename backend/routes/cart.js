import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

// GET /api/cart/:userId - Get user's cart
router.get('/:userId', [
  param('userId').isString().trim().notEmpty()
], handleValidationErrors, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId })
      .populate('items.product', 'name image price category inStock');
    
    if (!cart) {
      return res.json({ 
        userId: req.params.userId,
        items: [],
        totalAmount: 0,
        totalItems: 0
      });
    }
    
    // Filter out items with deleted products
    cart.items = cart.items.filter(item => item.product);
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
});

// POST /api/cart/:userId/add - Add item to cart
router.post('/:userId/add', [
  param('userId').isString().trim().notEmpty(),
  body('productId').isMongoId(),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('size').optional().isString().trim(),
  body('customization').optional().isObject()
], handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1, size, customization } = req.body;
    
    // Verify product exists and is in stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (!product.inStock) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }
    
    // Find or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      item.size === size
    );
    
    if (existingItemIndex > -1) {
      // Update quantity of existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        size,
        customization,
        price: product.price
      });
    }
    
    await cart.save();
    await cart.populate('items.product', 'name image price category inStock');
    
    res.json({
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});

// PUT /api/cart/:userId - Update entire cart
router.put('/:userId', [
  param('userId').isString().trim().notEmpty(),
  body('items').isArray(),
  body('items.*.product').optional().isMongoId(),
  body('items.*.quantity').optional().isInt({ min: 1 }),
  body('items.*.price').optional().isFloat({ min: 0 }),
  body('specialInstructions').optional().isString().isLength({ max: 500 })
], handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    const { items, specialInstructions, discountCode } = req.body;
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId });
    }
    
    // Validate all products exist
    const productIds = items.map(item => item.product).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'Some products not found' });
    }
    
    cart.items = items;
    if (specialInstructions !== undefined) {
      cart.specialInstructions = specialInstructions;
    }
    
    // Apply discount code if provided
    if (discountCode) {
      // Simple discount logic - extend as needed
      if (discountCode.toLowerCase() === 'groovy20') {
        cart.discountCode = {
          code: discountCode,
          discount: 20,
          discountType: 'percentage'
        };
      } else if (discountCode.toLowerCase() === 'welcome10') {
        cart.discountCode = {
          code: discountCode,
          discount: 10,
          discountType: 'percentage'
        };
      }
    }
    
    await cart.save();
    await cart.populate('items.product', 'name image price category inStock');
    
    res.json({
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
});

// PUT /api/cart/:userId/item/:itemId - Update specific cart item
router.put('/:userId/item/:itemId', [
  param('userId').isString().trim().notEmpty(),
  param('itemId').isMongoId(),
  body('quantity').optional().isInt({ min: 1 }),
  body('size').optional().isString().trim(),
  body('customization').optional().isObject()
], handleValidationErrors, async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const updates = req.body;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    Object.assign(item, updates);
    await cart.save();
    await cart.populate('items.product', 'name image price category inStock');
    
    res.json({
      message: 'Cart item updated successfully',
      cart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
});

// DELETE /api/cart/:userId/remove/:itemId - Remove item from cart
router.delete('/:userId/remove/:itemId', [
  param('userId').isString().trim().notEmpty(),
  param('itemId').isMongoId()
], handleValidationErrors, async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items.pull({ _id: itemId });
    await cart.save();
    await cart.populate('items.product', 'name image price category inStock');
    
    res.json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
});

// DELETE /api/cart/:userId/clear - Clear entire cart
router.delete('/:userId/clear', [
  param('userId').isString().trim().notEmpty()
], handleValidationErrors, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.discountCode = undefined;
    cart.specialInstructions = '';
    await cart.save();
    
    res.json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
});

export default router;