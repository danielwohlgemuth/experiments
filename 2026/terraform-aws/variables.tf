variable "aws_region" {
  type        = string
  description = "The AWS Region to deploy the solution to"
  default     = "us-east-2"
}

variable "s3_name" {
  type        = string
  description = "The name of the S3 bucket"
  default     = "random-word-frontend"
}

