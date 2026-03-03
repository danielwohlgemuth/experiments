provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "production"
      Application = "random_word"
    }
  }
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "random_word_backend" {
  name               = "lambda_execution_role_backend"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "archive_file" "random_word_backend" {
  type        = "zip"
  source_file = "${path.module}/lambda/index.js"
  output_path = "${path.module}/lambda/function.zip"
}

resource "aws_lambda_function" "random_word_backend" {
  filename      = data.archive_file.random_word_backend.output_path
  function_name = "random_word_backend"
  role          = aws_iam_role.random_word_backend.arn
  handler       = "index.handler"
  code_sha256   = data.archive_file.random_word_backend.output_base64sha256
  runtime       = "nodejs20.x"
  environment {
    variables = {
      ENVIRONMENT = "production"
      LOG_LEVEL   = "info"
    }
  }
}

resource "aws_lambda_function_url" "random_word_backend" {
  function_name      = aws_lambda_function.random_word_backend.function_name
  authorization_type = "NONE"
  cors {
    allow_origins = ["https://${aws_cloudfront_distribution.random_word_frontend.domain_name}", "http://localhost:3000"]
    allow_methods = ["GET"]
  }
}

resource "aws_s3_bucket" "random_word_frontend" {
  bucket = var.s3_name
}

resource "aws_s3_bucket_website_configuration" "random_word_frontend" {
  bucket = aws_s3_bucket.random_word_frontend.id
  index_document {
    suffix = "index.html"
  }
}

locals {
  frontend_folder        = "frontend"
  frontend_output_folder = "frontend/out"
  mime_types = {
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".ico"  = "image/vnd.microsoft.icon"
    ".jpeg" = "image/jpeg"
    ".png"  = "image/png"
    ".svg"  = "image/svg+xml"
  }
}

data "external" "random_word_frontend" {
  program = ["bash", "-c", "cd ${path.module}/${local.frontend_folder} && npm run build > /dev/null && echo {}"]
}

resource "aws_s3_object" "random_word_frontend" {
  for_each     = fileset(local.frontend_output_folder, "**/*")
  bucket       = aws_s3_bucket.random_word_frontend.id
  key          = each.key
  source       = "${local.frontend_output_folder}/${each.value}"
  source_hash  = filesha256("${local.frontend_output_folder}/${each.value}")
  content_type = lookup(local.mime_types, regex("\\.[^.]+$", each.value), null)
  depends_on   = [data.external.random_word_frontend]
}

data "aws_iam_policy_document" "random_word_frontend" {
  statement {
    sid    = "AllowCloudFrontServicePrincipalReadWrite"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    actions = [
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = [
      "${aws_s3_bucket.random_word_frontend.arn}/*",
    ]
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.random_word_frontend.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "random_word_frontend" {
  bucket = aws_s3_bucket.random_word_frontend.bucket
  policy = data.aws_iam_policy_document.random_word_frontend.json
}

resource "aws_cloudfront_origin_access_control" "random_word_frontend" {
  name                              = "default-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

locals {
  s3_origin_id = "${var.s3_name}-origin"
}

resource "aws_cloudfront_distribution" "random_word_frontend" {
  enabled = true
  origin {
    origin_id                = local.s3_origin_id
    domain_name              = aws_s3_bucket.random_word_frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.random_word_frontend.id
  }
  default_cache_behavior {
    target_origin_id = local.s3_origin_id
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  price_class = "PriceClass_100"
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
}

