# Build a turn-based game with Amazon DynamoDB and Amazon SNS

This project follows is an implementation of the [Build a turn-based game with Amazon DynamoDB and Amazon SNS](https://aws.amazon.com/tutorials/turn-based-game-dynamodb-amazon-sns/) tutorial.

The turn-based game is called [Nim](https://en.wikipedia.org/wiki/Nim).
Two players take turns removing objects from a number of heaps.
On each turn, a player removes one or more objects from a single heap.
The player who takes the last object loses (called a misère play).

## Pre-requisites

- AWS CLI
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

## Setup

### 2. General setup

Install the dependencies

```bash
npm install --prefix scripts/ && npm install --prefix application/ && npm install --prefix cdk/ && npm install --prefix frontend/
```

Set your AWS region

```bash
echo "export AWS_REGION=us-east-2" >> env.sh && source env.sh
echo "export PHONE_NUMBER=+15555555555" >> env.sh && source env.sh
source env.sh
```

Next, choose between setting up with AWS CDK or manually using the AWS CLI.

### 3.a. Setup with AWS CDK

Go to the cdk directory

```bash
cd cdk
```

Install Node.js modules

```bash
npm install
```

Deploy resources

```bash
cdk deploy
```

Delete resources

```bash
cdk destroy
```

### 3.b. Manual setup steps

If you did step `3.a.`, you can skip these steps as they have a similar end result.

Create table

```bash
bash scripts/create-table.sh
```

Create game

```bash
node scripts/createGame.js
```

Perform move

```bash
node scripts/performMove.js
```

Send SMS message

```bash
node scripts/sendMessage.js
```

Create user pool

```bash
bash scripts/create-user-pool.sh
```

Create user pool client

```bash
bash scripts/create-user-pool-client.sh
```

Create lambda

```bash
bash scripts/create-lambda.sh
```

Create REST API

```bash
bash scripts/create-rest-api.sh
```

Delete resources

```bash
bash scripts/delete-resources.sh
```

### 4. Interact with the API through the CLI

Source environment variables

```bash
source env.sh
```

Create users

```bash
curl -X POST ${BASE_URL}/users \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "first.user",
    "password": "Password1",
    "email": "first.user@example.com.invalid",
    "phoneNumber": "'${PHONE_NUMBER}'"
}'

curl -X POST ${BASE_URL}/users \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "second.user",
    "password": "Password1",
    "email": "second.user@example.com.invalid",
    "phoneNumber": "'${PHONE_NUMBER}'"
}'
```

Login first user

> Note that these are session credentials which expire after some time and need to be re-issued after that

```bash
curl -X POST ${BASE_URL}/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "first.user",
    "password": "Password1"
}'
```

It should return

```bash
{"idToken":"<idToken>"}
```

Export first ID token

```bash
export FIRST_ID_TOKEN=<idToken>
```

Login second user

```bash
curl -X POST ${BASE_URL}/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "second.user",
    "password": "Password1"
}'
```

It should return

```bash
{"idToken":"<idToken>"}
```

Export second ID token

```bash
export SECOND_ID_TOKEN=<idToken>
```

Create game

```bash
curl -X POST ${BASE_URL}/games \
 -H 'Content-Type: application/json' \
  -H "Authorization: ${FIRST_ID_TOKEN}" \
  -d '{
    "opponent": "second.user"
}'
```

It should return

```bash
{"gameId":"a07b5398", ...}
```

Export game ID

```bash
export GAME_ID=<yourGameId>
```

Fetch game

```bash
curl -X GET ${BASE_URL}/games/${GAME_ID}
```

Perform moves

```bash
curl -X POST ${BASE_URL}/games/${GAME_ID} \
  -H "Authorization: ${SECOND_ID_TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
    "changedHeap": "heap1",
    "changedHeapValue": 0
}'

curl -X POST ${BASE_URL}/games/${GAME_ID} \
  -H "Authorization: ${FIRST_ID_TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
    "changedHeap": "heap2",
    "changedHeapValue": 0
}'

curl -X POST ${BASE_URL}/games/${GAME_ID} \
  -H "Authorization: ${SECOND_ID_TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
    "changedHeap": "heap3",
    "changedHeapValue": 0
}'
```
