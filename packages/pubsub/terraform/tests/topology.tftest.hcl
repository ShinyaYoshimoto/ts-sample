# GCP に接続せず（mock_provider）、plan の内容を確かめる: terraform test
mock_provider "google" {
  mock_data "google_project" {
    defaults = {
      number = "123456789"
    }
  }
}

variables {
  project_id = "test-project"
}

run "names_come_from_shared_topology_json" {
  command = plan

  assert {
    condition     = google_pubsub_topic.events.name == "user-events"
    error_message = "トピック名が src/topology.json と一致しません"
  }
  assert {
    condition     = google_pubsub_subscription.welcome_mail.dead_letter_policy[0].max_delivery_attempts == 5
    error_message = "Dead Letter までの配信回数が src/topology.json と一致しません"
  }
  assert {
    condition     = google_pubsub_topic_iam_member.dead_letter_publisher.member == "serviceAccount:service-123456789@gcp-sa-pubsub.iam.gserviceaccount.com"
    error_message = "Dead Letter の権限が Pub/Sub のサービスエージェントに付いていません"
  }
}

run "push_subscription_is_skipped_without_endpoint" {
  command = plan

  assert {
    condition     = length(google_pubsub_subscription.search_index) == 0
    error_message = "push_endpoint がないのに Push 型サブスクリプションが作られます"
  }
}

run "push_subscription_uses_oidc" {
  command = plan

  variables {
    push_endpoint = "https://example.run.app/pubsub/push"
  }

  assert {
    condition     = google_pubsub_subscription.search_index[0].push_config[0].push_endpoint == "https://example.run.app/pubsub/push"
    error_message = "Push 先が設定されていません"
  }
  assert {
    condition     = length(google_pubsub_subscription_iam_member.search_index_dead_letter_subscriber) == 1
    error_message = "Push 型サブスクリプションに Dead Letter 用の権限が付いていません"
  }
}

run "push_endpoint_must_be_https" {
  command = plan

  variables {
    push_endpoint = "http://localhost:8080/pubsub/push"
  }

  expect_failures = [var.push_endpoint]
}
