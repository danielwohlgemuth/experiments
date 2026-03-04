# Manage Docker with Terraform

This is a follow-along of the tutorial available at https://developer.hashicorp.com/terraform/tutorials/docker-get-started.

## Prerequisites

- Docker
- OpenTofu (Terraform replacement)

## Configuration

```bash
# Initialize directory
tofu init

# Format configuration
tofu fmt

# Validate configuration
tofu validate

# Generate execution plan
tofu plan

# Apply configuration
tofu apply
tofy apply -var "container_name=YetAnotherName"

# Inspect state
tofu show

# Manage state
tofu state list

# Print output
tofu output

# Terminate resources
tofu destroy
```
