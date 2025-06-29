#!/bin/bash

# Generate the key pair in the PEM format using the ed25519 algorithm and no passphrase
# Save the key pair as aws-simple-architecture-key-pair.pub and aws-simple-architecture-key-pair
ssh-keygen \
    -m PEM \
    -t ed25519 \
    -N "" \
    -f aws-simple-architecture-key-pair

# Import the key pair to AWS
if [ $? -eq 0 ]; then
    aws ec2 import-key-pair \
        --key-name aws-simple-architecture-key-pair \
        --public-key-material fileb://aws-simple-architecture-key-pair.pub
    echo "Key pair imported successfully"
fi