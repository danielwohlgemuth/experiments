# Build a turn-based game with Amazon DynamoDB and Amazon SNS

This project used the [Build a turn-based game with Amazon DynamoDB and Amazon SNS](https://aws.amazon.com/tutorials/turn-based-game-dynamodb-amazon-sns/) tutorial as a starting point. It was extended to have a React frontend and to setup the AWS resources using CloudFormation through AWS CDK.

The turn-based game this is all about is called [Nim](https://en.wikipedia.org/wiki/Nim).
Here is a short introduction to the game:
- Two players take turns removing objects from a number of heaps
- On each turn, a player removes one or more objects from a single heap
- The player who takes the last object loses (called a misère play)

AWS Architecture

![AWS Architecture](/2024/turn-based-game-dynamodb-amazon-sns/assets/turn-based-game-architecture.drawio.png)

[AWS Architecture diagram file](https://app.diagrams.net/?title=turn-based-game-architecture#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2024%2Fturn-based-game-dynamodb-amazon-sns%2Fassets%2Fturn-based-game-architecture.drawio)

Technologies used:
- AWS
  - Lambda
  - API Gateway
  - CloudFront
  - S3
  - DynamoDB
  - SNS
  - Cognito
  - CDK
  - CloudFormation
- JavaScript
  - React
  - Redux
  - Material UI
  - Next.js
  - Express.js

## Pre-requisites

- AWS CDK CLI
- Node.js
- Add sandbox destination phone numbers

### Add sandbox destination phone numbers

Your account will likely be in the SMS sandbox.
This means that you can only send SMS messages to phone numbers that have been verified.
To make a number verified,
go to `Amazon SNS` -> `Text messaging (SMS)` -> `Sandbox destination phone numbers`,
add a phone number, and enter the verification code you receive on your phone.

### Billing

AWS Free Tier does not apply to SMS messages.
See the [AWS End User Messaging Pricing](https://aws.amazon.com/end-user-messaging/pricing/) page for the price of each message in your country.

### Enable sending SMS messages

Since SMS messages are not free and to make development easier, sending SMS messages is disabled by default. It can be enabled by setting the `SEND_SMS` environment variable to `1` in the Lambda function.

## Setup

Install the dependencies

```bash
npm install --prefix application/ && npm install --prefix cdk/ && npm install --prefix frontend/
```

Go to the cdk directory

```bash
cd cdk
```

Deploy resources

```bash
cdk deploy
```

Delete resources

```bash
cdk destroy
```

## Interface

Initial Wireframes

![Initial Wireframes](/2024/turn-based-game-dynamodb-amazon-sns/assets/turn-based-game-wireframe.drawio.png)

[Wireframe file](https://app.diagrams.net/?title=turn-based-game-wireframe#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2024%2Fturn-based-game-dynamodb-amazon-sns%2Fassets%2Fturn-based-game-wireframe.drawio)

Final Screenshots

![Final Screenshots](/2024/turn-based-game-dynamodb-amazon-sns/assets/turn-based-game-screenshots.drawio.png)
