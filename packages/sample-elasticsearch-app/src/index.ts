import { ElasticsearchClient } from '@ts-sample/elasticsearch-client';
import { mockProducts } from './mockData';
import { ProductService } from './productService';

/**
 * Main entry point for the Elasticsearch sample application
 */
async function main() {
	console.log('=== Elasticsearch Sample Application ===\n');

	// Initialize Elasticsearch client
	const client = ElasticsearchClient.getInstance();

	// Check connection
	console.log('Checking Elasticsearch connection...');
	const isConnected = await client.ping();
	if (!isConnected) {
		console.error('Failed to connect to Elasticsearch');
		console.error(
			'Please make sure Elasticsearch is running on http://localhost:9200',
		);
		console.error('Run: docker-compose up -d elasticsearch');
		process.exit(1);
	}
	console.log('✓ Connected to Elasticsearch\n');

	// Initialize product service
	const productService = new ProductService(client);

	try {
		// Clean up existing index
		await productService.deleteIndex();

		// Initialize index with mappings
		console.log('Initializing products index...');
		await productService.initializeIndex();
		console.log('✓ Index initialized\n');

		// Index mock products
		console.log('Indexing mock products...');
		await productService.bulkIndexProducts(mockProducts);
		console.log('✓ Products indexed\n');

		// Example 1: Search all products
		console.log('=== Example 1: Search all products ===');
		const allProducts = await productService.searchProducts({});
		console.log(`Found ${allProducts.total} products`);
		allProducts.hits.forEach((hit) => {
			console.log(
				`- ${hit._source.name} (${hit._source.brand}) - $${hit._source.price}`,
			);
		});
		console.log();

		// Example 2: Search by keyword (fuzzy matching)
		console.log('=== Example 2: Search by keyword "iphone" ===');
		const iphoneResults = await productService.searchProducts({
			keyword: 'iphone',
		});
		console.log(`Found ${iphoneResults.total} products`);
		iphoneResults.hits.forEach((hit) => {
			console.log(`- ${hit._source.name} (score: ${hit._score.toFixed(2)})`);
		});
		console.log();

		// Example 3: Search by category
		console.log('=== Example 3: Search smartphones ===');
		const smartphones = await productService.searchProducts({
			category: 'smartphones',
		});
		console.log(`Found ${smartphones.total} smartphones`);
		smartphones.hits.forEach((hit) => {
			console.log(`- ${hit._source.name} - $${hit._source.price}`);
		});
		console.log();

		// Example 4: Search with price range
		console.log('=== Example 4: Products under $500 ===');
		const affordableProducts = await productService.searchProducts({
			maxPrice: 500,
		});
		console.log(`Found ${affordableProducts.total} products`);
		affordableProducts.hits.forEach((hit) => {
			console.log(`- ${hit._source.name} - $${hit._source.price}`);
		});
		console.log();

		// Example 5: Search in-stock products only
		console.log('=== Example 5: In-stock products only ===');
		const inStockProducts = await productService.searchProducts({
			inStock: true,
		});
		console.log(`Found ${inStockProducts.total} in-stock products`);
		console.log();

		// Example 6: Complex search - keyword + filters
		console.log('=== Example 6: Apple products under $1000 ===');
		const appleProducts = await productService.searchProducts({
			keyword: 'Apple',
			maxPrice: 1000,
			inStock: true,
		});
		console.log(`Found ${appleProducts.total} products`);
		appleProducts.hits.forEach((hit) => {
			console.log(
				`- ${hit._source.name} - $${hit._source.price} (${hit._source.category})`,
			);
		});
		console.log();

		// Example 7: Fuzzy search demonstration
		console.log('=== Example 7: Fuzzy search for "Samsang" (typo) ===');
		const fuzzyResults = await productService.searchProducts({
			keyword: 'Samsang', // Typo: should find "Samsung"
		});
		console.log(`Found ${fuzzyResults.total} products (fuzzy matching)`);
		fuzzyResults.hits.forEach((hit) => {
			console.log(`- ${hit._source.name} (score: ${hit._score.toFixed(2)})`);
		});
		console.log();

		console.log('=== All examples completed successfully! ===');
	} catch (error) {
		console.error('Error during execution:', error);
		throw error;
	} finally {
		// Close the client connection
		await client.close();
	}
}

// Run the main function
main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
