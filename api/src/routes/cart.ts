import express from 'express';
import { Cart } from '../models/cart';
import { CartItem, CartItemWithProduct } from '../models/cartItem';
import { products } from '../seedData';

const router = express.Router();

// In-memory storage for demo purposes
let carts: Cart[] = [];
let cartItems: CartItem[] = [];
let nextCartId = 1;
let nextCartItemId = 1;

// Helper function to find or create cart for user
const findOrCreateCart = (userId: string): Cart => {
  let cart = carts.find(c => c.userId === userId);
  if (!cart) {
    cart = {
      cartId: nextCartId++,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    carts.push(cart);
  }
  return cart;
};

// Helper function to get cart items with product details
const getCartItemsWithProducts = (cartId: number): CartItemWithProduct[] => {
  return cartItems
    .filter(item => item.cartId === cartId)
    .map(item => {
      const product = products.find(p => p.productId === item.productId);
      return {
        ...item,
        product: product!
      };
    })
    .filter(item => item.product); // Filter out items with missing products
};

/**
 * @swagger
 * /api/cart/{userId}:
 *   get:
 *     summary: Get cart contents for a user
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User identifier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart contents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   $ref: '#/components/schemas/Cart'
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CartItemWithProduct'
 *                 totalItems:
 *                   type: integer
 *                 totalPrice:
 *                   type: number
 */
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const cart = findOrCreateCart(userId);
  const items = getCartItemsWithProducts(cart.cartId);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  res.json({
    cart,
    items,
    totalItems,
    totalPrice: Math.round(totalPrice * 100) / 100
  });
});

/**
 * @swagger
 * /api/cart/{userId}/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User identifier
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemWithProduct'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Product not found
 */
router.post('/:userId/items', (req, res) => {
  const { userId } = req.params;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'productId and quantity (min 1) are required' });
  }

  // Check if product exists
  const product = products.find(p => p.productId === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const cart = findOrCreateCart(userId);
  
  // Check if item already exists in cart
  const existingItem = cartItems.find(item => 
    item.cartId === cart.cartId && item.productId === productId
  );

  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity;
  } else {
    // Add new item
    const newItem: CartItem = {
      cartItemId: nextCartItemId++,
      cartId: cart.cartId,
      productId,
      quantity,
      addedAt: new Date().toISOString()
    };
    cartItems.push(newItem);
  }

  // Update cart timestamp
  cart.updatedAt = new Date().toISOString();

  // Return the updated item with product details
  const updatedItem = cartItems.find(item => 
    item.cartId === cart.cartId && item.productId === productId
  )!;
  
  res.status(201).json({
    ...updatedItem,
    product
  });
});

/**
 * @swagger
 * /api/cart/{userId}/items/{cartItemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User identifier
 *         schema:
 *           type: string
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         description: Cart item ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemWithProduct'
 *       400:
 *         description: Invalid quantity
 *       404:
 *         description: Cart item not found
 */
router.put('/:userId/items/:cartItemId', (req, res) => {
  const { userId, cartItemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'quantity (min 1) is required' });
  }

  // Find cart item first, then validate cart ownership
  const item = cartItems.find(item => item.cartItemId === parseInt(cartItemId));
  
  if (!item) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  const cart = carts.find(c => c.userId === userId && c.cartId === item.cartId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  item.quantity = quantity;
  cart.updatedAt = new Date().toISOString();

  const product = products.find(p => p.productId === item.productId)!;
  
  res.json({
    ...item,
    product
  });
});

/**
 * @swagger
 * /api/cart/{userId}/items/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User identifier
 *         schema:
 *           type: string
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         description: Cart item ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Cart item removed successfully
 *       404:
 *         description: Cart item not found
 */
router.delete('/:userId/items/:cartItemId', (req, res) => {
  const { userId, cartItemId } = req.params;

  // Find cart item first, then validate cart ownership
  const itemIndex = cartItems.findIndex(item => item.cartItemId === parseInt(cartItemId));
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  const item = cartItems[itemIndex];
  const cart = carts.find(c => c.userId === userId && c.cartId === item.cartId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart item not found' });
  }

  cartItems.splice(itemIndex, 1);
  cart.updatedAt = new Date().toISOString();

  res.status(204).send();
});

/**
 * @swagger
 * /api/cart/{userId}/clear:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: User identifier
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 */
router.delete('/:userId/clear', (req, res) => {
  const { userId } = req.params;

  const cart = carts.find(c => c.userId === userId);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  // Remove all items for this cart
  cartItems = cartItems.filter(item => item.cartId !== cart.cartId);
  cart.updatedAt = new Date().toISOString();

  res.status(204).send();
});

// Export function to reset data for testing
export const resetCartData = () => {
  carts = [];
  cartItems = [];
  nextCartId = 1;
  nextCartItemId = 1;
};

export default router;