/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       required:
 *         - cartId
 *         - userId
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         cartId:
 *           type: integer
 *           description: Unique identifier for the cart
 *           example: 1
 *         userId:
 *           type: string
 *           description: User identifier (can be session-based for anonymous users)
 *           example: "user123"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Cart creation timestamp
 *           example: "2023-01-01T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Cart last update timestamp
 *           example: "2023-01-01T00:00:00Z"
 */
export interface Cart {
  cartId: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}