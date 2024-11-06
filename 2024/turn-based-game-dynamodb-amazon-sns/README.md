# Build a turn-based game with Amazon DynamoDB and Amazon SNS

This project follows is an implementation of the [Build a turn-based game with Amazon DynamoDB and Amazon SNS](https://aws.amazon.com/tutorials/turn-based-game-dynamodb-amazon-sns/) tutorial.

## Setup steps

Install the dependencies

```bash
npm install --prefix scripts/ && npm install --prefix application/
```

Set your AWS region

```bash
echo "export AWS_REGION=us-east-2" >> env.sh && source env.sh
source env.sh
```
