import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ElasticsearchClient } from './client';

describe('ElasticsearchClient', () => {
	beforeEach(() => {
		ElasticsearchClient.resetInstance();
	});

	afterEach(() => {
		ElasticsearchClient.resetInstance();
	});

	it('should create a singleton instance', () => {
		const instance1 = ElasticsearchClient.getInstance({
			node: 'http://localhost:9200',
		});
		const instance2 = ElasticsearchClient.getInstance();

		expect(instance1).toBe(instance2);
	});

	it('should use environment variable for default configuration', () => {
		process.env.ELASTICSEARCH_NODE = 'http://test:9200';
		const instance = ElasticsearchClient.getInstance();
		expect(instance).toBeDefined();
		expect(instance.getClient()).toBeDefined();
		delete process.env.ELASTICSEARCH_NODE;
	});

	it('should reset instance', () => {
		const instance1 = ElasticsearchClient.getInstance({
			node: 'http://localhost:9200',
		});
		ElasticsearchClient.resetInstance();
		const instance2 = ElasticsearchClient.getInstance({
			node: 'http://localhost:9200',
		});

		expect(instance1).not.toBe(instance2);
	});

	it('should create client with auth config', () => {
		const instance = ElasticsearchClient.getInstance({
			node: 'http://localhost:9200',
			auth: {
				username: 'elastic',
				password: 'password',
			},
		});
		expect(instance).toBeDefined();
		expect(instance.getClient()).toBeDefined();
	});
});
