import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3_deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import { spawnSync } from 'child_process';
import { join } from 'path';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.TableV2(this, 'DynamoDB', {
      tableName: 'turn-based-game',
      partitionKey: {
        name: 'gameId',
        type: dynamodb.AttributeType.STRING
      },
      billing: dynamodb.Billing.provisioned({
        readCapacity: dynamodb.Capacity.fixed(5),
        writeCapacity: dynamodb.Capacity.autoscaled({ maxCapacity: 5 }),
      }),
      timeToLiveAttribute: 'expireAt',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'gsi-user1',
      partitionKey: {
        name: 'user1',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'gsi-user2',
      partitionKey: {
        name: 'user2',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const pool = new cognito.UserPool(this, 'CognitoUserPool', {
      userPoolName: 'turn-based-users',
      standardAttributes: {
        phoneNumber: {
          required: true,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const poolClient = new cognito.UserPoolClient(this, 'CognitoUserPoolClient', {
      userPool: pool,
      userPoolClientName: 'turn-based-backend',
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
      },
    });

    const role = new iam.Role(this, 'Role', {
      roleName: 'turn-based-api-lambda-role',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:Query',
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents',
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminSetUserPassword',
        'cognito-idp:AdminInitiateAuth',
        'cognito-idp:AdminGetUser',
        'sns:Publish',
      ],
      resources: ['*'],
    }));

    const fn = new lambda.Function(this, 'Lambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('../application'),
      role,
      timeout: cdk.Duration.seconds(12),
      memorySize: 128,
      environment: {
        'USER_POOL_ID': pool.userPoolId,
        'COGNITO_CLIENT_ID': poolClient.userPoolClientId,
        'SEND_SMS': process.env.SEND_SMS || '',
      },
    });

    const api = new apigateway.RestApi(this, 'Api', {
      restApiName: 'Turn-based API',
    });

    api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(fn),
      defaultMethodOptions: {
        authorizationType: apigateway.AuthorizationType.NONE,
      },
      anyMethod: true,
    });

    fn.addPermission('LambdaPermission', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
      sourceArn: api.arnForExecuteApi(),
    });

    const bucket = new s3.Bucket(this, 'FrontendBucket', {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const distribution = new cloudfront.Distribution(this, 'CloudfrontDistribution', {
      defaultBehavior: {
        origin: cloudfront_origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    new s3_deployment.BucketDeployment(this, 'BucketDeployment', {
      sources: [
        s3_deployment.Source.asset(join(__dirname, '../../frontend'), {
          bundling: {
            local: {
              tryBundle(outputDir: string) {
                spawnSync(
                  [
                    'cd ' + join(__dirname, '../../frontend'),
                    'npm run build',
                    'cp -R out/ ' + outputDir,
                  ].join(" && "),
                  {
                    shell: true, // for debugging
                    stdio: "inherit",
                  }
                );
                return true;
              },
            },
            command: ['sh', '-c', 'echo "Docker build not supported. Please install esbuild."'],
            image: cdk.DockerImage.fromRegistry('alpine'),
            environment: {
              NEXT_PUBLIC_APP_URL: api.url,
            },
          },
        }),
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, "ApiURL", {
      value: api.url,
      description: "The application URL",
      exportName: "ApiURL",
    });
    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: distribution.domainName,
      description: "The distribution URL",
      exportName: "CloudfrontURL",
    });
  }
}
