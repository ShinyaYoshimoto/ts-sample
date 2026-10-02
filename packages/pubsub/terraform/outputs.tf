output "topic" {
  description = "イベントのトピック"
  value       = google_pubsub_topic.events.id
}

output "subscriptions" {
  description = "作成したサブスクリプション"
  value = {
    welcome_mail        = google_pubsub_subscription.welcome_mail.id
    search_index        = one(google_pubsub_subscription.search_index[*].id)
    dead_letter_inspect = google_pubsub_subscription.dead_letter_inspect.id
  }
}

output "push_service_account_email" {
  description = "Push に OIDC トークンを付けるサービスアカウント。Cloud Run サービスにこのアカウントの roles/run.invoker を付ける"
  value       = google_service_account.push.email
}

output "pubsub_service_agent" {
  description = "Pub/Sub のサービスエージェント（Dead Letter と OIDC トークン発行を行う）"
  value       = local.pubsub_service_agent
}
