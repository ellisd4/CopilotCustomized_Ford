import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import productRouter from './product';
import { products as seedProducts } from '../seedData';

let app: express.Express;

describe('Product API', () => {
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/products', productRouter);
    });

    it('should get all products including the OctoCat Bundle', async () => {
        const response = await request(app).get('/products');
        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(seedProducts.length);
        
        // Verify the OctoCat Bundle product exists
        const octocatBundle = response.body.find((p: any) => p.productId === 14);
        expect(octocatBundle).toBeDefined();
        expect(octocatBundle.name).toBe('OctoCat Premium Collection Bundle');
        expect(octocatBundle.sku).toBe('OCTO-BUNDLE-001');
        expect(octocatBundle.price).toBe(149.99);
        expect(octocatBundle.supplierId).toBe(3);
        expect(octocatBundle.discount).toBe(0.15);
        expect(octocatBundle.imgName).toBe('octocat-bundle.png');
        expect(octocatBundle.unit).toBe('bundle');
    });

    it('should get the OctoCat Bundle by ID', async () => {
        const response = await request(app).get('/products/14');
        expect(response.status).toBe(200);
        expect(response.body.productId).toBe(14);
        expect(response.body.name).toBe('OctoCat Premium Collection Bundle');
        expect(response.body.description).toContain('InvisiCat, DevCat, and GitCat');
    });
});
