# WebSocket Chat App

This project presents a chat app running on AWS that uses WebSocket to exchange messages instantly.

It used the [Tutorial: Create a WebSocket chat app with a WebSocket API, Lambda and DynamoDB](https://docs.aws.amazon.com/apigateway/latest/developerguide/websocket-api-chat-app.html) as a starting point, replacing DynamoDB with ElastiCache (Redis) and adding a React frontend.

![WebSocket Chat App](/2025/websocket-chat-app/assets/chat-app.png)

AWS Architecture

![AWS Architecture](/2025/websocket-chat-app/assets/websocket-chat-app.drawio.png)

[AWS Architecture diagram file](https://app.diagrams.net/?title=websocket-chat-app#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2024%2Fwebsocket-chat-app%2Fassets%2Fwebsocket-chat-app.drawio)

Technologies used:

- WebSocket API
- Lambda
- ElastiCache (Redis)
- CloudFront
- S3
- CodeBuild
- Cloud Development Kit (CDK)
- React
- Next.js

## Pre-requisites

- AWS CDK CLI
- Node.js

## Setup AWS

### Create GitHub connection

1. In AWS, go to CodeBuild -> Settings -> Connections
2. Click `Create connection`
3. Select `GitHub` as the provider and set the name to `websocket-chat-app`
4. In AWS, click `Connect`
5. Copy the ARN of the connection
6. Run the following command. Replace `CONNECTION_ARN_HERE` with the ARN from the previous command.

```bash
aws codebuild import-source-credentials --auth-type CODECONNECTIONS --server-type GITHUB --token CONNECTION_ARN_HERE
```

To get the connection ARN through the CLI, use this command.

```bash
aws codebuild list-source-credentials --query "sourceCredentialsInfos[?serverType=='GITHUB' && authType=='CODECONNECTIONS'].arn" --output text
```

### Deploy using CDK

Deploy 

```bash
cd cdk
cdk deploy --all
```

After the first deployment succeeds, uncomment `source: gitHubSource,` in [cdk/lib/frontend-stack.ts](/2025/websocket-chat-app/cdk/lib/frontend-stack.ts), and run `cdk deploy --all` again.

### Build the frontend

After completing the previous section, there will be an output from the CLI saying `FrontendStack.CloudFrontURL`, followed by the URL. If you try to access it at this point, you'll get an 403 Access Denied error, because the frontend hasn't been built yet and so the S3 bucket is still empty.

There are two ways to get the frontend to build:
- Push a new change to the repo
- Manually trigger a build

To manually start a build through the AWS Console, go to CodeBuild -> Build -> Build projects -> websocket-chat-app and click on `Start build`.

To trigger a build through the AWS CLI, use this.

```bash
aws codebuild start-build --project-name websocket-chat-app
```

After the build finishes, the frontend should be accessible at the CloudFront URL.

### How to chat through the CLI

Instead of using the frontend to chat, it's also possible to interact with the WebSocket API directly using the CLI.
For this, use the value of `BackendStack.WebSocketURL` from the CLI output of the `cdk deploy --all` command and replace `WEBSOCKET_URL_HERE` in the following command with it.

```bash
npx wscat -c "WEBSOCKET_URL_HERE"
```

Make sure to have two websocket connection open and then enter the following text in one connection
to see it appear on the other connection.

```bash
{"action": "sendMessage", "message": "Hello, everyone! 🎉"}
```
