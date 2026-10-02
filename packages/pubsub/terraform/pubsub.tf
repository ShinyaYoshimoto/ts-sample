# user-events ──┬─▶ welcome-mail（Pull 型）  ─┐
#               └─▶ search-index（Push 型）  ─┴─ 5回失敗したら ▶ user-events-dead-letter
#
# エミュレーターでは src/topology.ts（pnpm setup:topology）が同じ構成を作る。

resource "google_pubsub_topic" "events" {
  name = local.names.topic

  depends_on = [google_project_service.this]
}

resource "google_pubsub_topic" "dead_letter" {
  name = local.names.deadLetterTopic

  depends_on = [google_project_service.this]
}

resource "google_pubsub_subscription" "welcome_mail" {
  name                 = local.names.welcomeMailSubscription
  topic                = google_pubsub_topic.events.id
  ack_deadline_seconds = local.topology.ackDeadlineSeconds

  dead_letter_policy {
    dead_letter_topic     = local.dead_letter_policy.dead_letter_topic
    max_delivery_attempts = local.dead_letter_policy.max_delivery_attempts
  }
}

resource "google_pubsub_subscription" "search_index" {
  count = var.push_endpoint == null ? 0 : 1

  name                 = local.names.searchIndexSubscription
  topic                = google_pubsub_topic.events.id
  ack_deadline_seconds = local.topology.ackDeadlineSeconds

  push_config {
    push_endpoint = var.push_endpoint

    # Pub/Sub がこのサービスアカウントの OIDC トークンを Authorization ヘッダーに付けて配信する。
    # Cloud Run を認証必須にしておけば、Pub/Sub 以外からのリクエストを弾ける
    oidc_token {
      service_account_email = google_service_account.push.email
    }
  }

  dead_letter_policy {
    dead_letter_topic     = local.dead_letter_policy.dead_letter_topic
    max_delivery_attempts = local.dead_letter_policy.max_delivery_attempts
  }
}

# Dead Letter に落ちたメッセージを確認するためのサブスクリプション
resource "google_pubsub_subscription" "dead_letter_inspect" {
  name  = local.names.deadLetterSubscription
  topic = google_pubsub_topic.dead_letter.id

  # 調査用なので長めに残す
  message_retention_duration = "604800s"
}
