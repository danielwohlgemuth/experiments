output "cloudfront_url" {
  value = aws_cloudfront_distribution.random_word_frontend.domain_name
}

output "lambda_url" {
  value = aws_lambda_function_url.random_word_backend.function_url
}

