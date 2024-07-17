provider "kubernetes" {
  config_path = var.kubeconfig_path
}

resource "kubernetes_namespace" "catalog_api" {
  metadata {
    name = "catalog-api"
  }
}

resource "kubernetes_secret" "env_vars" {
  metadata {
    name      = "env-vars"
    namespace = kubernetes_namespace.catalog_api.metadata[0].name
  }

  data = {
    NODE_ENV                  = base64encode("development")
    PORT                      = base64encode("3000")
    MONGO_USERNAME            = base64encode("")
    MONGO_PASSWORD            = base64encode("")
    MONGO_PORT                = base64encode("27017")
    MONGO_HOST                = base64encode("catalog-api-mongodb")
    MONGO_DATABASE            = base64encode("ptx-catalog")
    API_URL                   = base64encode("http://localhost:3000/v1")
    JWT_SECRET_KEY            = base64encode("abc123")
    SALT_ROUNDS               = base64encode("10")
    CONTRACT_SERVICE_ENDPOINT = base64encode("http://localhost:8888")
  }
}

resource "kubernetes_deployment" "catalog_api" {
  metadata {
    name      = "catalog-api"
    namespace = kubernetes_namespace.catalog_api.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "catalog-api"
      }
    }

    template {
      metadata {
        labels = {
          app = "catalog-api"
        }
      }

      spec {
        container {
          image = "catalog-api:latest"
          name  = "catalog-api"

          port {
            container_port = var.port
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.env_vars.metadata[0].name
            }
          }

          volume_mount {
            mount_path = "/data/db"
            name       = "catalog-data"
          }
        }

        container {
          image = "mongo:latest"
          name  = "mongodb"

          volume_mount {
            mount_path = "/data/db"
            name       = "catalog-data"
          }
        }

        volume {
          name = "catalog-data"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mongo_data.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "catalog_api" {
  metadata {
    name      = "catalog-api"
    namespace = kubernetes_namespace.catalog_api.metadata[0].name
  }

  spec {
    selector = {
      app = "catalog-api"
    }

    port {
      port        = var.port
      target_port = var.port
    }

    type = "LoadBalancer"
  }
}

resource "kubernetes_persistent_volume" "mongo_data" {
  metadata {
    name = "mongo-data"
  }

  spec {
    capacity = {
      storage = "5Gi"
    }

    access_modes = ["ReadWriteOnce"]

    persistent_volume_reclaim_policy = "Retain"

    host_path {
      path = "/mnt/data"
    }
  }
}

resource "kubernetes_persistent_volume_claim" "mongo_data" {
  metadata {
    name      = "mongo-data"
    namespace = kubernetes_namespace.catalog_api.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "5Gi"
      }
    }
  }
}
