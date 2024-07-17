output "catalog_api_service_ip" {
  value = kubernetes_service.catalog_api.status[0].load_balancer[0].ingress[0].ip
}

output "catalog_api_namespace" {
  value = kubernetes_namespace.catalog_api.metadata[0].name
}
