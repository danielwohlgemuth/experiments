# Deploy to AWS with Terraform


## Prerequisite

- OpenTofu
- AWS CLI
- AWS Account

## Setup

Set the access token

```bash
export AWS_ACCESS_KEY_ID="<aws_access_key_id>"
export AWS_SECRET_ACCESS_KEY="<aws_secret_access_key>"
```

```bash
tofu init
tofu plan
tofu apply
```

Other useful commands

```bash
tofu fmt
tofu validate
```


