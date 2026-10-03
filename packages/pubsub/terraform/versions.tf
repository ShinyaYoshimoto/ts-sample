terraform {
  required_version = ">= 1.9"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 8.0"
    }
  }

  # 検証用なので state は手元に置く。複数人や CI から apply するようになったら GCS に移す:
  # backend "gcs" {
  #   bucket = "<STATE_BUCKET>"
  #   prefix = "ts-sample/pubsub"
  # }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
