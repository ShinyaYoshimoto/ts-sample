/**
 * Product interface for Elasticsearch documents
 */
export interface Product {
	id?: string;
	name: string;
	description: string;
	price: number;
	category: string;
	brand: string;
	inStock: boolean;
	tags: string[];
	createdAt: string;
}

/**
 * Product search query parameters
 */
export interface ProductSearchQuery {
	keyword?: string;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
	inStock?: boolean;
}
