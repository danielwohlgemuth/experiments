import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { AttributeType, Billing, Capacity, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class BackendStack extends cdk.Stack {
  readonly webSocketURL: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new TableV2(this, 'Table', {
      partitionKey: { name: 'connectionId', type: AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billing: Billing.provisioned({
        readCapacity: Capacity.fixed(5),
        writeCapacity: Capacity.autoscaled({ maxCapacity: 5 }),
      }),
    });

    const connectBackendAppDir = join(__dirname, '../../backend/connect');
    const connectFunction = new NodejsFunction(this, 'ConnectBackend', {
      projectRoot: connectBackendAppDir,
      entry: join(connectBackendAppDir, 'index.cts'),
      depsLockFilePath: join(connectBackendAppDir, 'package-lock.json'),
      runtime: Runtime.NODEJS_22_X,
      environment: {
        'TABLE_NAME': table.tableName,
      },
    });
    connectFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'dynamodb:BatchWriteItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:DescribeTable',
      ],
      effect: Effect.ALLOW,
      resources: [
        table.tableArn,
      ],
    }));

    const disconnectBackendAppDir = join(__dirname, '../../backend/disconnect');
    const disconnectFunction = new NodejsFunction(this, 'DisconnectBackend', {
      projectRoot: disconnectBackendAppDir,
      entry: join(disconnectBackendAppDir, 'index.cts'),
      depsLockFilePath: join(disconnectBackendAppDir, 'package-lock.json'),
      runtime: Runtime.NODEJS_22_X,
      environment: {
        'TABLE_NAME': table.tableName,
      },
    });
    disconnectFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'dynamodb:BatchWriteItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:DescribeTable',
      ],
      effect: Effect.ALLOW,
      resources: [
        table.tableArn,
      ],
    }));

    const sendMessageBackendAppDir = join(__dirname, '../../backend/sendMessage');
    const sendMessageFunction = new NodejsFunction(this, 'SendMessageBackend', {
      projectRoot: sendMessageBackendAppDir,
      entry: join(sendMessageBackendAppDir, 'index.cts'),
      depsLockFilePath: join(sendMessageBackendAppDir, 'package-lock.json'),
      runtime: Runtime.NODEJS_22_X,
      environment: {
        'TABLE_NAME': table.tableName,
      },
    });
    sendMessageFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'dynamodb:BatchGetItem',
        'dynamodb:GetRecords',
        'dynamodb:GetShardIterator',
        'dynamodb:Query',
        'dynamodb:GetItem',
        'dynamodb:Scan',
        'dynamodb:ConditionCheckItem',
        'dynamodb:DescribeTable',
      ],
      effect: Effect.ALLOW,
      resources: [
        table.tableArn,
      ],
    }));

    const webSocketApi = new WebSocketApi(this, 'WebSocketApi');    
    sendMessageFunction.addToRolePolicy(new PolicyStatement({
      actions: [
        'execute-api:ManageConnections',
      ],
      effect: Effect.ALLOW,
      resources: [
        `arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.apiId}/prod/POST/@connections/*`,
      ],
    }));
    const webSocketStage = new WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    webSocketApi.addRoute('$connect', {
      integration: new WebSocketLambdaIntegration('ConnectIntegration', connectFunction),
    });
    webSocketApi.addRoute('$disconnect', {
      integration: new WebSocketLambdaIntegration('DisconnectIntegration', disconnectFunction),
    });
    webSocketApi.addRoute('sendMessage', {
      integration: new WebSocketLambdaIntegration('SendMessageIntegration', sendMessageFunction),
    });

    new cdk.CfnOutput(this, "WebSocketURL", {
      value: webSocketStage.url,
      description: "The WebSocket URL",
      exportName: "WebSocketURL",
    });
  }
}
