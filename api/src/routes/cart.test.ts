import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import cartRouter, { resetCartData } from './cart';

let app: express.Express;

describe('Cart API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/cart', cartRouter);
        resetCartData();
    });

    describe('GET /cart/:userId', () => {
        it('should create and return empty cart for new user', async () => {
            const response = await request(app).get('/cart/user123');
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('cart');
            expect(response.body).toHaveProperty('items');
            expect(response.body).toHaveProperty('totalItems');
            expect(response.body).toHaveProperty('totalPrice');
            expect(response.body.cart.userId).toBe('user123');
            expect(response.body.items).toHaveLength(0);
            expect(response.body.totalItems).toBe(0);
            expect(response.body.totalPrice).toBe(0);
        });

        it('should return same cart for repeated requests', async () => {
            const response1 = await request(app).get('/cart/user123');
            const response2 = await request(app).get('/cart/user123');
            
            expect(response1.body.cart.cartId).toBe(response2.body.cart.cartId);
        });
    });

    describe('POST /cart/:userId/items', () => {
        it('should add new item to cart', async () => {
            const newItem = {
                productId: 1,
                quantity: 2
            };

            const response = await request(app)
                .post('/cart/user123/items')
                .send(newItem);

            expect(response.status).toBe(201);
            expect(response.body.productId).toBe(1);
            expect(response.body.quantity).toBe(2);
            expect(response.body).toHaveProperty('product');
            expect(response.body.product.productId).toBe(1);
        });

        it('should update quantity if item already exists in cart', async () => {
            const newItem = { productId: 1, quantity: 2 };

            // Add item first time
            await request(app)
                .post('/cart/user123/items')
                .send(newItem);

            // Add same item again
            const response = await request(app)
                .post('/cart/user123/items')
                .send(newItem);

            expect(response.status).toBe(201);
            expect(response.body.quantity).toBe(4); // 2 + 2
        });

        it('should return 400 for missing productId', async () => {
            const response = await request(app)
                .post('/cart/user123/items')
                .send({ quantity: 2 });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('productId');
        });

        it('should return 400 for missing quantity', async () => {
            const response = await request(app)
                .post('/cart/user123/items')
                .send({ productId: 1 });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('quantity');
        });

        it('should return 400 for zero quantity', async () => {
            const response = await request(app)
                .post('/cart/user123/items')
                .send({ productId: 1, quantity: 0 });

            expect(response.status).toBe(400);
        });

        it('should return 404 for non-existent product', async () => {
            const response = await request(app)
                .post('/cart/user123/items')
                .send({ productId: 999, quantity: 1 });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Product not found');
        });
    });

    describe('PUT /cart/:userId/items/:cartItemId', () => {
        it('should update cart item quantity', async () => {
            // Add item first
            const addResponse = await request(app)
                .post('/cart/user123/items')
                .send({ productId: 1, quantity: 2 });

            const cartItemId = addResponse.body.cartItemId;

            // Update quantity
            const updateResponse = await request(app)
                .put(`/cart/user123/items/${cartItemId}`)
                .send({ quantity: 5 });

            expect(updateResponse.status).toBe(200);
            expect(updateResponse.body.quantity).toBe(5);
            expect(updateResponse.body.cartItemId).toBe(cartItemId);
        });

        it('should return 404 for non-existent cart item', async () => {
            const response = await request(app)
                .put('/cart/user123/items/999')
                .send({ quantity: 5 });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Cart item not found');
        });

        it('should return 400 for invalid quantity', async () => {
            // Add item first
            const addResponse = await request(app)
                .post('/cart/user123/items')
                .send({ productId: 1, quantity: 2 });

            const cartItemId = addResponse.body.cartItemId;

            // Try to update with invalid quantity
            const updateResponse = await request(app)
                .put(`/cart/user123/items/${cartItemId}`)
                .send({ quantity: 0 });

            expect(updateResponse.status).toBe(400);
        });
    });

    describe('DELETE /cart/:userId/items/:cartItemId', () => {
        it('should remove item from cart', async () => {
            // Add item first
            const addResponse = await request(app)
                .post('/cart/user123/items')
                .send({ productId: 1, quantity: 2 });

            const cartItemId = addResponse.body.cartItemId;

            // Remove item
            const deleteResponse = await request(app)
                .delete(`/cart/user123/items/${cartItemId}`);

            expect(deleteResponse.status).toBe(204);

            // Verify item is removed
            const cartResponse = await request(app).get('/cart/user123');
            expect(cartResponse.body.items).toHaveLength(0);
        });

        it('should return 404 for non-existent cart item', async () => {
            const response = await request(app)
                .delete('/cart/user123/items/999');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Cart item not found');
        });
    });

    describe('DELETE /cart/:userId/clear', () => {
        it('should clear all items from cart', async () => {
            // Add multiple items
            await request(app)
                .post('/cart/user123/items')
                .send({ productId: 1, quantity: 2 });
            
            await request(app)
                .post('/cart/user123/items')
                .send({ productId: 2, quantity: 3 });

            // Clear cart
            const clearResponse = await request(app)
                .delete('/cart/user123/clear');

            expect(clearResponse.status).toBe(204);

            // Verify cart is empty
            const cartResponse = await request(app).get('/cart/user123');
            expect(cartResponse.body.items).toHaveLength(0);
            expect(cartResponse.body.totalItems).toBe(0);
        });

        it('should return 404 for non-existent cart', async () => {
            const response = await request(app)
                .delete('/cart/nonexistent/clear');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Cart not found');
        });
    });

    describe('Cart totals calculation', () => {
        it('should calculate correct totals for multiple items', async () => {
            // Add multiple items
            await request(app)
                .post('/cart/user123/items')
                .send({ productId: 1, quantity: 2 }); // SmartFeeder One: $129.99 * 2 = $259.98
            
            await request(app)
                .post('/cart/user123/items')
                .send({ productId: 2, quantity: 1 }); // AutoClean Litter Dome: $199.99 * 1 = $199.99

            const cartResponse = await request(app).get('/cart/user123');
            
            expect(cartResponse.body.totalItems).toBe(3); // 2 + 1
            expect(cartResponse.body.totalPrice).toBe(459.97); // 259.98 + 199.99
            expect(cartResponse.body.items).toHaveLength(2);
        });
    });

    describe('User isolation', () => {
        it('should maintain separate carts for different users', async () => {
            // Add item to user1's cart
            await request(app)
                .post('/cart/user1/items')
                .send({ productId: 1, quantity: 2 });

            // Add item to user2's cart
            await request(app)
                .post('/cart/user2/items')
                .send({ productId: 2, quantity: 3 });

            // Check user1's cart
            const cart1Response = await request(app).get('/cart/user1');
            expect(cart1Response.body.items).toHaveLength(1);
            expect(cart1Response.body.items[0].productId).toBe(1);

            // Check user2's cart
            const cart2Response = await request(app).get('/cart/user2');
            expect(cart2Response.body.items).toHaveLength(1);
            expect(cart2Response.body.items[0].productId).toBe(2);
        });
    });
});