import {
	ElasticsearchClient,
	SearchResult,
} from '@ts-sample/elasticsearch-client';
import { Product, ProductSearchQuery } from './types';

const PRODUCTS_INDEX = 'products';

/**
 * Service class for managing products in Elasticsearch
 */
export class ProductService {
	private client: ElasticsearchClient;

	constructor(client: ElasticsearchClient) {
		this.client = client;
	}

	/**
	 * Initialize the products index with proper mappings
	 */
	async initializeIndex(): Promise<void> {
		const exists = await this.client.indexExists(PRODUCTS_INDEX);
		if (exists) {
			console.log(`Index ${PRODUCTS_INDEX} already exists`);
			return;
		}

		await this.client.createIndexWithMapping({
			index: PRODUCTS_INDEX,
			mappings: {
				properties: {
					name: {
						type: 'text',
						fields: {
							keyword: { type: 'keyword' },
						},
					},
					description: {
						type: 'text',
					},
					price: {
						type: 'float',
					},
					category: {
						type: 'keyword',
					},
					brand: {
						type: 'keyword',
					},
					inStock: {
						type: 'boolean',
					},
					tags: {
						type: 'keyword',
					},
					createdAt: {
						type: 'date',
					},
				},
			},
		});
		console.log(`Index ${PRODUCTS_INDEX} created successfully`);
	}

	/**
	 * Index a single product
	 */
	async indexProduct(product: Product): Promise<string> {
		return await this.client.indexDocument({
			index: PRODUCTS_INDEX,
			id: product.id,
			document: product,
		});
	}

	/**
	 * Bulk index multiple products
	 */
	async bulkIndexProducts(products: Product[]): Promise<void> {
		await this.client.bulkIndexDocuments(PRODUCTS_INDEX, products);
		console.log(`Indexed ${products.length} products`);
	}

	/**
	 * Search products with various query options
	 */
	async searchProducts(
		query: ProductSearchQuery,
	): Promise<SearchResult<Product>> {
		const { keyword, category, minPrice, maxPrice, inStock } = query;

		// Build the Elasticsearch query
		const must: any[] = [];
		const filter: any[] = [];

		// Text search with fuzzy matching
		if (keyword) {
			must.push({
				multi_match: {
					query: keyword,
					fields: ['name^2', 'description', 'brand'],
					fuzziness: 'AUTO',
				},
			});
		}

		// Category filter
		if (category) {
			filter.push({
				term: { category },
			});
		}

		// Price range filter
		if (minPrice !== undefined || maxPrice !== undefined) {
			const range: any = {};
			if (minPrice !== undefined) {
				range.gte = minPrice;
			}
			if (maxPrice !== undefined) {
				range.lte = maxPrice;
			}
			filter.push({
				range: { price: range },
			});
		}

		// Stock filter
		if (inStock !== undefined) {
			filter.push({
				term: { inStock },
			});
		}

		// If no must clauses, match all
		if (must.length === 0) {
			must.push({ match_all: {} });
		}

		const esQuery = {
			bool: {
				must,
				filter: filter.length > 0 ? filter : undefined,
			},
		};

		return await this.client.search<Product>({
			index: PRODUCTS_INDEX,
			query: esQuery,
			size: 20,
		});
	}

	/**
	 * Get product by ID
	 */
	async getProduct(id: string): Promise<Product | null> {
		return await this.client.getDocument<Product>(PRODUCTS_INDEX, id);
	}

	/**
	 * Delete the products index
	 */
	async deleteIndex(): Promise<void> {
		const exists = await this.client.indexExists(PRODUCTS_INDEX);
		if (exists) {
			await this.client.deleteIndex(PRODUCTS_INDEX);
			console.log(`Index ${PRODUCTS_INDEX} deleted`);
		}
	}
}
