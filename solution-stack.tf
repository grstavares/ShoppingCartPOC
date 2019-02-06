provider "aws" {
  profile = "backenddev"
  region="us-east-1"
}

resource "aws_cloudformation_stack" "pocStack" {
  name = "ShoppingCartPOC"
  capabilities = ["CAPABILITY_NAMED_IAM"]
  template_body = "${file("${path.module}/packaged.yml")}"
}
