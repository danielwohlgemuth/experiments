import * as cdk from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class CognitoStack extends cdk.Stack {
  readonly pool: UserPool;
  readonly poolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.pool = new UserPool(this, "CognitoUserPool", {
      userPoolName: "turn-based-users",
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

    this.poolClient = new UserPoolClient(this, "CognitoUserPoolClient", {
      userPool: this.pool,
      userPoolClientName: "turn-based-backend",
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
      },
    });
  }
}
