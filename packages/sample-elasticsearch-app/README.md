# @ts-sample/sample-elasticsearch-app

Elasticsearchを使った商品検索のサンプル実装。共有クライアントパッケージ（@ts-sample/elasticsearch-client）を使用して、実践的な検索機能を実演します。

## 特徴

- 商品データモデルの定義
- インデックスのマッピング定義
- バルクインデックス処理
- 複数の検索パターンの実装
  - キーワード検索（fuzzy matching）
  - カテゴリフィルタ
  - 価格範囲フィルタ
  - 在庫状況フィルタ
- TypeScriptによる型安全な実装
- 統合テスト

## 前提条件

Elasticsearchが起動している必要があります。

```bash
# docker-composeでElasticsearchを起動
docker-compose up -d elasticsearch kibana
```

Elasticsearchが起動したら、http://localhost:9200 でアクセスできます。
Kibanaは http://localhost:5601 でアクセスできます。

## インストール

```bash
# ルートディレクトリから
pnpm install
```

## 使用方法

### サンプルアプリケーションの実行

```bash
cd packages/sample-elasticsearch-app
pnpm start
```

実行すると、以下の処理が行われます：

1. Elasticsearchへの接続確認
2. `products`インデックスの作成（マッピング定義付き）
3. モックデータ（10件の商品）のインデックス登録
4. 様々な検索パターンのデモンストレーション

### 実行例

```
=== Elasticsearch Sample Application ===

Checking Elasticsearch connection...
✓ Connected to Elasticsearch

Initializing products index...
Index products created successfully
✓ Index initialized

Indexing mock products...
Indexed 10 products
✓ Products indexed

=== Example 1: Search all products ===
Found 10 products
- iPhone 15 Pro (Apple) - $999.99
- Samsung Galaxy S24 Ultra (Samsung) - $1199.99
...

=== Example 2: Search by keyword "iphone" ===
Found 1 products
- iPhone 15 Pro (score: 2.45)

=== Example 3: Search smartphones ===
Found 2 smartphones
- iPhone 15 Pro - $999.99
- Samsung Galaxy S24 Ultra - $1199.99
...
```

## データモデル

### Product

```typescript
interface Product {
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
```

### 商品カテゴリ

- `smartphones` - スマートフォン
- `laptops` - ノートパソコン
- `tablets` - タブレット
- `audio` - オーディオ機器
- `gaming` - ゲーム機

## 検索パターン

### 1. 全商品検索

```typescript
await productService.searchProducts({});
```

### 2. キーワード検索（fuzzy matching対応）

```typescript
await productService.searchProducts({
  keyword: 'iPhone'
});
```

タイポにも対応：`keyword: 'Samsang'` → Samsung製品がヒット

### 3. カテゴリフィルタ

```typescript
await productService.searchProducts({
  category: 'smartphones'
});
```

### 4. 価格範囲フィルタ

```typescript
await productService.searchProducts({
  minPrice: 100,
  maxPrice: 500
});
```

### 5. 在庫フィルタ

```typescript
await productService.searchProducts({
  inStock: true
});
```

### 6. 複合検索

```typescript
await productService.searchProducts({
  keyword: 'Apple',
  maxPrice: 1000,
  inStock: true
});
```

## テスト

### 単体テスト

```bash
pnpm test
```

### 統合テスト

統合テストは実際のElasticsearchインスタンスに接続して実行されます。
テスト実行前にElasticsearchが起動している必要があります。

```bash
# Elasticsearchを起動
docker-compose up -d elasticsearch

# テスト実行
pnpm test
```

## インデックスマッピング

```json
{
  "properties": {
    "name": {
      "type": "text",
      "fields": {
        "keyword": { "type": "keyword" }
      }
    },
    "description": { "type": "text" },
    "price": { "type": "float" },
    "category": { "type": "keyword" },
    "brand": { "type": "keyword" },
    "inStock": { "type": "boolean" },
    "tags": { "type": "keyword" },
    "createdAt": { "type": "date" }
  }
}
```

## 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `ELASTICSEARCH_NODE` | ElasticsearchノードのURL | `http://localhost:9200` |

## Kibanaでの確認

Kibana Dev Toolsを使ってインデックスを確認できます：

```
# すべての商品を取得
GET /products/_search
{
  "query": {
    "match_all": {}
  }
}

# 特定のカテゴリを検索
GET /products/_search
{
  "query": {
    "term": {
      "category": "smartphones"
    }
  }
}
```

## トラブルシューティング

### Elasticsearchに接続できない

```bash
# Elasticsearchのステータス確認
docker-compose ps

# Elasticsearchのログ確認
docker-compose logs elasticsearch

# Elasticsearchの再起動
docker-compose restart elasticsearch
```

### インデックスをリセットしたい

```bash
# curlでインデックスを削除
curl -X DELETE http://localhost:9200/products

# または、アプリケーション内で自動的に削除される
pnpm start
```
