import { Client, type ClientOptions } from '@elastic/elasticsearch';

export interface ElasticsearchConfig {
	node: string;
	auth?: {
		username: string;
		password: string;
	};
}

export interface SearchOptions<T> {
	index: string;
	query: any;
	size?: number;
	from?: number;
}

export interface SearchResult<T> {
	hits: Array<{
		_id: string;
		_source: T;
		_score: number;
	}>;
	total: number;
}

export interface IndexDocumentOptions<T> {
	index: string;
	id?: string;
	document: T;
}

export interface CreateIndexOptions {
	index: string;
	mappings?: any;
	settings?: any;
}

/**
 * Elasticsearch client wrapper with common operations
 * Implements singleton pattern for connection management
 */
export class ElasticsearchClient {
	private static instance: ElasticsearchClient | null = null;
	private client: Client;

	private constructor(config: ElasticsearchConfig) {
		const clientOptions: ClientOptions = {
			node: config.node,
		};

		if (config.auth) {
			clientOptions.auth = config.auth;
		}

		this.client = new Client(clientOptions);
	}

	/**
	 * Get or create singleton instance
	 */
	public static getInstance(config?: ElasticsearchConfig): ElasticsearchClient {
		if (!ElasticsearchClient.instance) {
			if (!config) {
				// Default configuration from environment variables
				const node = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
				config = { node };
			}
			ElasticsearchClient.instance = new ElasticsearchClient(config);
		}
		return ElasticsearchClient.instance;
	}

	/**
	 * Reset singleton instance (useful for testing)
	 */
	public static resetInstance(): void {
		ElasticsearchClient.instance = null;
	}

	/**
	 * Get the underlying Elasticsearch client
	 */
	public getClient(): Client {
		return this.client;
	}

	/**
	 * Check if Elasticsearch is available
	 */
	public async ping(): Promise<boolean> {
		try {
			await this.client.ping();
			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Create an index with optional mappings and settings
	 */
	public async createIndexWithMapping(
		options: CreateIndexOptions,
	): Promise<void> {
		const { index, mappings, settings } = options;

		await this.client.indices.create({
			index,
			mappings,
			settings,
		});
	}

	/**
	 * Check if an index exists
	 */
	public async indexExists(index: string): Promise<boolean> {
		return await this.client.indices.exists({ index });
	}

	/**
	 * Delete an index
	 */
	public async deleteIndex(index: string): Promise<void> {
		await this.client.indices.delete({ index });
	}

	/**
	 * Index a document
	 */
	public async indexDocument<T>(
		options: IndexDocumentOptions<T>,
	): Promise<string> {
		const { index, id, document } = options;

		const response = await this.client.index({
			index,
			id,
			document: document as any,
		});

		return response._id;
	}

	/**
	 * Bulk index documents
	 */
	public async bulkIndexDocuments<T>(
		index: string,
		documents: T[],
	): Promise<void> {
		const operations = documents.flatMap((doc) => [
			{ index: { _index: index } },
			doc,
		]);

		await this.client.bulk({ operations: operations as any });
		// Refresh to make documents searchable immediately
		await this.client.indices.refresh({ index });
	}

	/**
	 * Search documents with type safety
	 */
	public async search<T>(options: SearchOptions<T>): Promise<SearchResult<T>> {
		const { index, query, size = 10, from = 0 } = options;

		const response = await this.client.search({
			index,
			query,
			size,
			from,
		});

		const hits = response.hits.hits.map((hit: any) => ({
			_id: hit._id,
			_source: hit._source as T,
			_score: hit._score || 0,
		}));

		const total =
			typeof response.hits.total === 'number'
				? response.hits.total
				: response.hits.total?.value || 0;

		return {
			hits,
			total,
		};
	}

	/**
	 * Get a document by ID
	 */
	public async getDocument<T>(index: string, id: string): Promise<T | null> {
		try {
			const response = await this.client.get({
				index,
				id,
			});
			return response._source as T;
		} catch (error: any) {
			if (error.meta?.statusCode === 404) {
				return null;
			}
			throw error;
		}
	}

	/**
	 * Delete a document by ID
	 */
	public async deleteDocument(index: string, id: string): Promise<void> {
		await this.client.delete({
			index,
			id,
		});
	}

	/**
	 * Close the client connection
	 */
	public async close(): Promise<void> {
		await this.client.close();
	}
}
