# @ts-sample/elasticsearch-client

Elasticsearch共有クライアントパッケージ。TypeScript型安全なElasticsearch操作を提供します。

## 特徴

- シングルトンパターンによる接続管理
- TypeScriptの型安全性
- 基本的なCRUD操作のサポート
- バルクインデックス機能
- 環境変数による設定

## インストール

```bash
pnpm install
```

## 使用方法

### クライアントの初期化

```typescript
import { ElasticsearchClient } from '@ts-sample/elasticsearch-client';

// デフォルト設定（環境変数 ELASTICSEARCH_NODE を使用）
const client = ElasticsearchClient.getInstance();

// カスタム設定
const client = ElasticsearchClient.getInstance({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'password'
  }
});
```

### インデックスの作成

```typescript
await client.createIndexWithMapping({
  index: 'products',
  mappings: {
    properties: {
      name: { type: 'text' },
      price: { type: 'float' },
      category: { type: 'keyword' }
    }
  }
});
```

### ドキュメントのインデックス

```typescript
// 単一ドキュメント
const docId = await client.indexDocument({
  index: 'products',
  document: {
    name: 'Product 1',
    price: 100.0,
    category: 'electronics'
  }
});

// バルクインデックス
await client.bulkIndexDocuments('products', [
  { name: 'Product 1', price: 100.0 },
  { name: 'Product 2', price: 200.0 }
]);
```

### 検索

```typescript
interface Product {
  name: string;
  price: number;
  category: string;
}

const result = await client.search<Product>({
  index: 'products',
  query: {
    match: {
      name: 'Product'
    }
  },
  size: 10
});

console.log(result.hits); // Array<{ _id: string, _source: Product, _score: number }>
console.log(result.total); // 検索結果の総数
```

### ドキュメントの取得

```typescript
const product = await client.getDocument<Product>('products', 'doc-id');
```

### ドキュメントの削除

```typescript
await client.deleteDocument('products', 'doc-id');
```

### インデックスの削除

```typescript
await client.deleteIndex('products');
```

## 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `ELASTICSEARCH_NODE` | ElasticsearchノードのURL | `http://localhost:9200` |

## 開発

```bash
# ビルド
pnpm build

# テスト
pnpm test

# lint
pnpm lint
```

## API リファレンス

### ElasticsearchClient

#### メソッド

- `getInstance(config?: ElasticsearchConfig): ElasticsearchClient` - シングルトンインスタンスを取得
- `ping(): Promise<boolean>` - Elasticsearchの接続確認
- `createIndexWithMapping(options: CreateIndexOptions): Promise<void>` - インデックスを作成
- `indexExists(index: string): Promise<boolean>` - インデックスの存在確認
- `deleteIndex(index: string): Promise<void>` - インデックスを削除
- `indexDocument<T>(options: IndexDocumentOptions<T>): Promise<string>` - ドキュメントをインデックス
- `bulkIndexDocuments<T>(index: string, documents: T[]): Promise<void>` - 複数ドキュメントを一括インデックス
- `search<T>(options: SearchOptions<T>): Promise<SearchResult<T>>` - ドキュメントを検索
- `getDocument<T>(index: string, id: string): Promise<T | null>` - IDでドキュメントを取得
- `deleteDocument(index: string, id: string): Promise<void>` - ドキュメントを削除
- `close(): Promise<void>` - クライアント接続を閉じる
