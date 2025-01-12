import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { CfnCacheCluster, CfnSubnetGroup } from 'aws-cdk-lib/aws-elasticache';

export class BackendStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC for ElastiCache
    const vpc = new Vpc(this, 'RedisVpc', {
      maxAzs: 2, // Number of Availability Zones
    });

    // Security group for Lambda
    const lambdaSecurityGroup = new SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc,
      description: 'Security group for Lambda function',
      allowAllOutbound: true,
    });

    // Security group for Redis
    const redisSecurityGroup = new SecurityGroup(this, 'RedisSecurityGroup', {
      vpc,
      description: 'Allow inbound traffic to Redis',
    });

    // Allow traffic on the default Redis port (6379)
    redisSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      Port.tcp(6379),
      'Allow Redis access from Lambda'
    );

    // Create a subnet group for ElastiCache
    const subnetGroup = new CfnSubnetGroup(this, 'RedisSubnetGroup', {
      description: 'Subnet group for Redis',
      subnetIds: vpc.privateSubnets.map((subnet) => subnet.subnetId),
    });

    // Create the ElastiCache Redis cluster
    const redisCluster = new CfnCacheCluster(this, 'RedisCluster', {
      engine: 'redis',
      cacheNodeType: 'cache.t3.micro',
      numCacheNodes: 1,
      vpcSecurityGroupIds: [redisSecurityGroup.securityGroupId],
      cacheSubnetGroupName: subnetGroup.ref,
    });

    // Create Connect Lambda
    const connectBackendAppDir = join(__dirname, '../../backend/connect');
    const connectFunction = new NodejsFunction(this, 'ConnectBackend', {
      projectRoot: connectBackendAppDir,
      entry: join(connectBackendAppDir, 'index.cts'),
      depsLockFilePath: join(connectBackendAppDir, 'package-lock.json'),
      runtime: Runtime.NODEJS_22_X,
      environment: {
        'REDIS_HOST': redisCluster.attrRedisEndpointAddress,
        'REDIS_PORT': redisCluster.attrRedisEndpointPort,
      },
      vpc,
      securityGroups: [lambdaSecurityGroup],
    });

    // Create Disconnect Lambda
    const disconnectBackendAppDir = join(__dirname, '../../backend/disconnect');
    const disconnectFunction = new NodejsFunction(this, 'DisconnectBackend', {
      projectRoot: disconnectBackendAppDir,
      entry: join(disconnectBackendAppDir, 'index.cts'),
      depsLockFilePath: join(disconnectBackendAppDir, 'package-lock.json'),
      runtime: Runtime.NODEJS_22_X,
      environment: {
        'REDIS_HOST': redisCluster.attrRedisEndpointAddress,
        'REDIS_PORT': redisCluster.attrRedisEndpointPort,
      },
      vpc,
      securityGroups: [lambdaSecurityGroup],
    });

    // Create SendMessage Lambda
    const sendMessageBackendAppDir = join(__dirname, '../../backend/sendMessage');
    const sendMessageFunction = new NodejsFunction(this, 'SendMessageBackend', {
      projectRoot: sendMessageBackendAppDir,
      entry: join(sendMessageBackendAppDir, 'index.cts'),
      depsLockFilePath: join(sendMessageBackendAppDir, 'package-lock.json'),
      runtime: Runtime.NODEJS_22_X,
      environment: {
        'REDIS_HOST': redisCluster.attrRedisEndpointAddress,
        'REDIS_PORT': redisCluster.attrRedisEndpointPort,
      },
      vpc,
      securityGroups: [lambdaSecurityGroup],
    });

    // Create WebSocket API
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

    // Add routes to Lambda functions
    webSocketApi.addRoute('$connect', {
      integration: new WebSocketLambdaIntegration('ConnectIntegration', connectFunction),
    });
    webSocketApi.addRoute('$disconnect', {
      integration: new WebSocketLambdaIntegration('DisconnectIntegration', disconnectFunction),
    });
    webSocketApi.addRoute('sendMessage', {
      integration: new WebSocketLambdaIntegration('SendMessageIntegration', sendMessageFunction),
    });

    // Output WebSocket URL for use in frontend
    new cdk.CfnOutput(this, "WebSocketURL", {
      value: webSocketStage.url,
      description: "The WebSocket URL",
      exportName: "WebSocketURL",
    });
  }
}
