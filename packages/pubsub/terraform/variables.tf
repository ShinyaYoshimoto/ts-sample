variable "project_id" {
  description = "リソースを作る GCP プロジェクトの ID"
  type        = string
}

variable "region" {
  description = "既定のリージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "push_endpoint" {
  description = "Push 型サブスクリプション（search-index）の配信先 URL（例: https://<SERVICE_URL>/pubsub/push）。null なら Push 型は作らない"
  type        = string
  default     = null

  validation {
    condition     = var.push_endpoint == null || startswith(coalesce(var.push_endpoint, ""), "https://")
    error_message = "本物の Pub/Sub の Push 先は HTTPS である必要があります。"
  }
}

variable "push_audience" {
  description = "Push に付ける OIDC トークンの audience。null なら push_endpoint のオリジン（https://<host>）を使う。Cloud Run はサービス URL（パスなし）と照合するため"
  type        = string
  default     = null
}

variable "push_service_account_id" {
  description = "Push に OIDC トークンを付けるサービスアカウントの ID（Cloud Run 側でこのアカウントに roles/run.invoker を付ける）"
  type        = string
  default     = "pubsub-push"
}

variable "publisher_members" {
  description = "user-events トピックに発行できるメンバー（例: serviceAccount:app@<PROJECT>.iam.gserviceaccount.com）"
  type        = list(string)
  default     = []
}

variable "welcome_mail_subscriber_members" {
  description = "welcome-mail サブスクリプションを Pull できるメンバー"
  type        = list(string)
  default     = []
}

variable "grant_token_creator_to_pubsub_agent" {
  description = "2021年4月8日より前に作られたプロジェクトでは true にする（Pub/Sub のサービスエージェントが Push 用の OIDC トークンを発行するために必要）"
  type        = bool
  default     = false
}
