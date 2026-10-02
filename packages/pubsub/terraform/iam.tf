# ---- Dead Letter ----
# Pub/Sub のサービスエージェントが、元のサブスクリプションから受け取り（subscriber）、
# Dead Letter トピックへ発行する（publisher）ための権限。エミュレーターでは不要だった部分

resource "google_pubsub_topic_iam_member" "dead_letter_publisher" {
  topic  = google_pubsub_topic.dead_letter.id
  role   = "roles/pubsub.publisher"
  member = local.pubsub_service_agent
}

resource "google_pubsub_subscription_iam_member" "welcome_mail_dead_letter_subscriber" {
  subscription = google_pubsub_subscription.welcome_mail.id
  role         = "roles/pubsub.subscriber"
  member       = local.pubsub_service_agent
}

resource "google_pubsub_subscription_iam_member" "search_index_dead_letter_subscriber" {
  count = length(google_pubsub_subscription.search_index)

  subscription = google_pubsub_subscription.search_index[0].id
  role         = "roles/pubsub.subscriber"
  member       = local.pubsub_service_agent
}

# ---- Push（OIDC） ----

resource "google_service_account" "push" {
  account_id   = var.push_service_account_id
  display_name = "Pub/Sub push invoker (ts-sample pubsub)"

  depends_on = [google_project_service.this]
}

# 古いプロジェクトでのみ必要。サービスエージェントが Push 用サービスアカウントのトークンを発行できるようにする
resource "google_service_account_iam_member" "pubsub_agent_token_creator" {
  count = var.grant_token_creator_to_pubsub_agent ? 1 : 0

  service_account_id = google_service_account.push.name
  role               = "roles/iam.serviceAccountTokenCreator"
  member             = local.pubsub_service_agent
}

# ---- アプリケーション ----
# プロジェクト全体ではなく、トピック・サブスクリプション単位で最小限の権限を付ける

resource "google_pubsub_topic_iam_member" "publishers" {
  for_each = toset(var.publisher_members)

  topic  = google_pubsub_topic.events.id
  role   = "roles/pubsub.publisher"
  member = each.value
}

resource "google_pubsub_subscription_iam_member" "welcome_mail_subscribers" {
  for_each = toset(var.welcome_mail_subscriber_members)

  subscription = google_pubsub_subscription.welcome_mail.id
  role         = "roles/pubsub.subscriber"
  member       = each.value
}
