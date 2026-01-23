import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ElasticsearchClient } from '@ts-sample/elasticsearch-client';
import { ProductService } from './productService';
import { Product } from './types';

describe('ProductService Integration Tests', () => {
	let client: ElasticsearchClient;
	let productService: ProductService;
	const testIndexName = 'test-products';

	beforeAll(async () => {
		// Initialize client and service
		client = ElasticsearchClient.getInstance();
		productService = new ProductService(client);
	});

	afterAll(async () => {
		// Clean up
		try {
			await productService.deleteIndex();
		} catch (error) {
			// Ignore errors during cleanup
		}
		await client.close();
		ElasticsearchClient.resetInstance();
	});

	it('should initialize index with proper mappings', async () => {
		await productService.initializeIndex();
		const exists = await client.indexExists('products');
		expect(exists).toBe(true);
	});

	it('should index and retrieve a product', async () => {
		const product: Product = {
			name: 'Test Product',
			description: 'A test product',
			price: 99.99,
			category: 'test',
			brand: 'TestBrand',
			inStock: true,
			tags: ['test'],
			createdAt: new Date().toISOString(),
		};

		const docId = await productService.indexProduct(product);
		expect(docId).toBeDefined();

		// Wait a bit for indexing
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const retrieved = await productService.getProduct(docId);
		expect(retrieved).toBeDefined();
		expect(retrieved?.name).toBe(product.name);
	});

	it('should search products by keyword', async () => {
		const testProducts: Product[] = [
			{
				name: 'iPhone 15',
				description: 'Apple smartphone',
				price: 999,
				category: 'phones',
				brand: 'Apple',
				inStock: true,
				tags: ['smartphone'],
				createdAt: new Date().toISOString(),
			},
			{
				name: 'Samsung Galaxy',
				description: 'Samsung smartphone',
				price: 899,
				category: 'phones',
				brand: 'Samsung',
				inStock: true,
				tags: ['smartphone'],
				createdAt: new Date().toISOString(),
			},
		];

		await productService.bulkIndexProducts(testProducts);

		// Wait for indexing
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const results = await productService.searchProducts({
			keyword: 'iPhone',
		});

		expect(results.total).toBeGreaterThan(0);
		expect(results.hits.length).toBeGreaterThan(0);
		expect(results.hits[0]._source.name).toContain('iPhone');
	});

	it('should filter products by category', async () => {
		const results = await productService.searchProducts({
			category: 'phones',
		});

		expect(results.total).toBeGreaterThan(0);
		results.hits.forEach((hit) => {
			expect(hit._source.category).toBe('phones');
		});
	});

	it('should filter products by price range', async () => {
		const results = await productService.searchProducts({
			minPrice: 100,
			maxPrice: 900,
		});

		results.hits.forEach((hit) => {
			expect(hit._source.price).toBeGreaterThanOrEqual(100);
			expect(hit._source.price).toBeLessThanOrEqual(900);
		});
	});

	it('should return empty results for non-existent keyword', async () => {
		const results = await productService.searchProducts({
			keyword: 'NonExistentProductXYZ123',
		});

		expect(results.hits).toEqual([]);
		expect(results.total).toBe(0);
	});

	it('should support fuzzy search', async () => {
		// Search with typo "Samsang" should find "Samsung"
		const results = await productService.searchProducts({
			keyword: 'Samsang',
		});

		// Should find results despite typo
		expect(results.total).toBeGreaterThan(0);
	});
});
