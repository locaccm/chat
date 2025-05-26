module "service_account_chats-service" {
  source       = "./modules/service_account"
  account_id   = "chats-service"
  display_name = "Chats Service Account"
  project_id   = "intricate-pad-455413-f7"
  roles        = [
    "roles/cloudsql.client",
  ]
}