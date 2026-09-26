# 概要

- イミュータブルデータモデルによるデータモデリングを行う
- 要求を元に、モデリングをし、最終的には実装に落とし込む

## 要求

- 発注担当者が受注リストを元に、商品の在庫を確認し、在庫があれば商品を注文者の注文時の送付先住所に発送する

## モデル

| 種別 | 和名           | 英名               | 分類     |
| ---- | -------------- | ------------------ | -------- |
| When | 注文           | Order              | イベント |
| Who  | 会員           | Member             | リソース |
| When | 注文確認       | Order Confirmation | イベント |
| Who  | 管理者         | Administrator      | リソース |
| When | 入金予定       | Scheduled Payment  | イベント |
| When | 入金           | Payment            | イベント |
| When | 請求書出力     | Invoice Issuance   | イベント |
| When | 注文キャンセル | Order Cancellation | イベント |

```mermaid
erDiagram

注文（E） {
  int 注文ID PK
  int 会員ID FK
  date 注文日時
}

注文確認（E） {
  int 注文確認ID PK
  int 注文ID FK
  int 注文確認者ID FK
  date 注文確認日
}

入金予定（E） {
  int 入金予定ID PK
  int 注文ID FK
  date 入金予定日
  date 入金予定登録日
}

入金（E） {
  int 入金ID PK
  int 注文ID FK
  date 入金日
  int 入金者ID FK
}

請求書出力 {
  int 請求書出力ID PK
  int 注文ID FK
  date 請求書出力日時
}

注文キャンセル {
  int 注文キャンセルID PK
  int 注文ID FK
  date 注文キャンセル日時
}

会員 {
  int 会員ID PK
}

管理者 {
  int 管理者ID PK
}

%% リレーション定義
注文（E） ||--o{ 会員 : "会員ID"
注文確認（E） }o--|| 注文（E） : "注文ID"
注文確認（E） }o--|| 管理者 : "注文確認者ID"
入金予定（E） }o--|| 注文（E） : "注文ID"
入金（E） }o--|| 注文（E） : "注文ID"
入金（E） }o--|| 管理者 : "入金者ID"
請求書出力 }o--|| 注文（E） : "注文ID"
注文キャンセル }o--|| 注文（E） : "注文ID"
```
