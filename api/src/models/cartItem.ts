/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - cartItemId
 *         - cartId
 *         - productId
 *         - quantity
 *         - addedAt
 *       properties:
 *         cartItemId:
 *           type: integer
 *           description: Unique identifier for the cart item
 *           example: 1
 *         cartId:
 *           type: integer
 *           description: ID of the cart this item belongs to
 *           example: 1
 *         productId:
 *           type: integer
 *           description: ID of the product in the cart
 *           example: 1
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity of the product in the cart
 *           example: 2
 *         addedAt:
 *           type: string
 *           format: date-time
 *           description: When the item was added to the cart
 *           example: "2023-01-01T00:00:00Z"
 */
export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  addedAt: string;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItemWithProduct:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/CartItem'
 *         - type: object
 *           properties:
 *             product:
 *               $ref: '#/components/schemas/Product'
 */
export interface CartItemWithProduct extends CartItem {
  product: {
    productId: number;
    supplierId: number;
    name: string;
    description: string;
    price: number;
    sku: string;
    unit: string;
    imgName: string;
    discount?: number;
  };
}