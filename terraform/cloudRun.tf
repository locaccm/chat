module "cloud_run_chats-service" {
  source                = "./modules/cloud_run"
  project_id            = "intricate-pad-455413-f7"
  region                = "europe-west1"
  service_name          = "chats-service"
  repository_id         = "locaccm-repo-docker"
  service_account_email = module.service_account_chats-service.email
  vpc_connector         = module.vpc_connector.id
  public                = false

  env_variables = {
    NODE_ENV = "production"
  }
  secrets = {
    DATABASE_URL = "DATABASE_URL_PROD"
  }
}

module "cloud_run_chats-service_invokers" {
  depends_on = [module.cloud_run_chats-service]
  source        = "./modules/cloud_run_invoker"
  region        = "europe-west1"
  service_name  = "chats-service"
  invokers = {
    frontend            = "frontend-service@intricate-pad-455413-f7.iam.gserviceaccount.com"
    authentification    = "auth-service@intricate-pad-455413-f7.iam.gserviceaccount.com"
  }
}