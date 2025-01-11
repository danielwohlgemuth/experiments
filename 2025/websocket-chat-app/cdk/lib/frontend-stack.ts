import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BuildSpec, EventAction, FilterGroup, Project, Source } from 'aws-cdk-lib/aws-codebuild';

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const gitHubOwner = new cdk.CfnParameter(this, "GitHubOwner", {
      type: "String",
      default: "danielwohlgemuth",
      description: "The GitHub account name",
    });
    const gitHubRepo = new cdk.CfnParameter(this, "GitHubRepo", {
      type: "String",
      default: "experiments",
      description: "The GitHub repo",
    });
    const gitHubPath = new cdk.CfnParameter(this, "GitHubPath", {
      type: "String",
      default: "2025/websocket-chat-app/frontend/.*",
      description: "The path to the project folder of the frontend",
    });

    const webSocketURL = cdk.Fn.importValue('WebSocketURL');

    // S3
    const bucket = new Bucket(this, "Frontend", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront
    const distribution = new Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(bucket),
      },
      defaultRootObject: "index.html",
      errorResponses: [{
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
        ttl: cdk.Duration.minutes(30)
      }],
    });

    // CodeBuild
    const gitHubSource = Source.gitHub({
      owner: gitHubOwner.valueAsString,
      repo: gitHubRepo.valueAsString,
      webhook: true,
      webhookFilters: [
        FilterGroup
          .inEventOf(EventAction.PUSH)
          .andBranchIs("main")
          .andFilePathIs(gitHubPath.valueAsString),
      ],
      cloneDepth: 1,
    });

    var buildSpec = BuildSpec.fromObject({
      version: 0.2,
      phases: {
        install: {
          "on-failure": "ABORT",
          commands: [
            "cd 2025/websocket-chat-app/frontend",
            "npm install",
          ],
        },
        build: {
          "on-failure": "ABORT",
          commands: [
            "npm run build",
          ],
        },
        post_build: {
          "on-failure": "ABORT",
          commands: [
            `aws s3 cp out/ s3://${bucket.bucketName}/ --recursive`,
          ],
        },
      },
    });

    var role = new Role(this, "Role", {
      assumedBy: new ServicePrincipal("codebuild.amazonaws.com")
    });
    // Allow connecting to GitHub
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "codeconnections:GetConnection",
        "codeconnections:GetConnectionToken",
      ],
      resources: [
        "arn:aws:codeconnections:*:*:connection/*",
      ],
    }));
    // Allow uploading the website files to S3
    role.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "s3:PutObject",
      ],
      resources: [
        `arn:aws:s3:::${bucket.bucketName}`,
        `arn:aws:s3:::${bucket.bucketName}/*`,
      ],
    }));

    new Project(this, "Project", {
      projectName: "websocket-chat-app",
      // Leave the line saying `source: gitHubSource,` commented when deploying the CDK stack for the first time.
      // Uncomment and redeploy it after the first deployment was successful.
      // source: gitHubSource,
      buildSpec: buildSpec,
      environmentVariables: {
        'NEXT_PUBLIC_WEBSOCKET_URL': {
          value: webSocketURL,
        },
      },
      role: role,
    });

    new cdk.CfnOutput(this, "CloudFrontURL", {
      exportName: "CloudFrontURL",
      value: distribution.distributionDomainName,
    });
  }
}
