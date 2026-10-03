locals {
  # トピック名や配信回数は TypeScript と同じファイルから読む（名前のずれを防ぐ）
  topology = jsondecode(file("${path.module}/../src/topology.json"))
  names    = local.topology.names

  dead_letter_policy = {
    dead_letter_topic     = google_pubsub_topic.dead_letter.id
    max_delivery_attempts = local.topology.maxDeliveryAttempts
  }

  # OIDC トークンの audience。未指定だと Pub/Sub は push_endpoint 全体（パス付き）を使うが、
  # Cloud Run はサービス URL（https://<host>）と照合するので、既定ではオリジンだけにする
  push_audience = var.push_endpoint == null ? null : coalesce(var.push_audience, regex("^https://[^/]+", var.push_endpoint))

  # Dead Letter への転送や Push の OIDC トークン発行は、Pub/Sub のサービスエージェントが行う
  pubsub_service_agent = "serviceAccount:service-${data.google_project.this.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}

data "google_project" "this" {
  project_id = var.project_id
}

resource "google_project_service" "this" {
  for_each = toset([
    "pubsub.googleapis.com",
    "iam.googleapis.com",
  ])

  service = each.value
  # destroy しても API は無効にしない（他のリソースが使っている可能性があるため）
  disable_on_destroy = false
}
