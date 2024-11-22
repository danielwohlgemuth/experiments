import * as cdk from "aws-cdk-lib";
import {
  AuthorizationType,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Runtime, Function } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { CognitoStack } from "./cognito-stack";

export class RestApiStack extends cdk.Stack {
  readonly api: RestApi;

  constructor(
    scope: Construct,
    id: string,
    cognitoStack: CognitoStack,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    const role = new Role(this, "Role", {
      roleName: "turn-based-api-lambda-role",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });

    role.addToPolicy(
      new PolicyStatement({
        actions: [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminSetUserPassword",
          "cognito-idp:AdminInitiateAuth",
          "cognito-idp:AdminGetUser",
          "sns:Publish",
        ],
        resources: ["*"],
      }),
    );

    const fn = new Function(this, "Lambda", {
      runtime: Runtime.NODEJS_20_X,
      handler: "handler.handler",
      code: Code.fromAsset("../application"),
      role,
      timeout: cdk.Duration.seconds(12),
      memorySize: 128,
      environment: {
        USER_POOL_ID: cognitoStack.pool?.userPoolId,
        COGNITO_CLIENT_ID: cognitoStack.poolClient?.userPoolClientId,
        SEND_SMS: process.env.SEND_SMS || "",
      },
    });

    this.api = new RestApi(this, "Api", {
      restApiName: "Turn-based API",
    });

    this.api.root.addProxy({
      defaultIntegration: new LambdaIntegration(fn),
      defaultMethodOptions: {
        authorizationType: AuthorizationType.NONE,
      },
      anyMethod: true,
    });

    fn.addPermission("LambdaPermission", {
      principal: new ServicePrincipal("apigateway.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: this.api.arnForExecuteApi(),
    });

    new cdk.CfnOutput(this, "ApiURL", {
      value: this.api.url,
      description: "The application URL",
      exportName: "apiURL",
    });
  }
}
