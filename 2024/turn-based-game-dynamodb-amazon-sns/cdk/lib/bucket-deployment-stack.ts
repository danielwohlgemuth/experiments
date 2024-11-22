import { Construct } from "constructs";
import { spawnSync, SpawnSyncOptions } from "child_process";
import { join } from "path";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import * as cdk from "aws-cdk-lib";
import { CloudFrontStack } from "./cloudfront-stack";

export class BucketDeploymentStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    cloudFrontStack: CloudFrontStack,
    apiUrl: string,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    const spawnSyncOptions: SpawnSyncOptions = {
      shell: true,
      stdio: "inherit",
    };

    new BucketDeployment(this, "BucketDeployment", {
      sources: [
        Source.asset(join(__dirname, "../../frontend"), {
          bundling: {
            local: {
              tryBundle(outputDir: string) {
                try {
                  spawnSync(
                    [
                      "cd " + join(__dirname, "../../frontend"),
                      "export NEXT_PUBLIC_APP_URL=" + apiUrl,
                      "npm run build",
                      "cp -R out/ " + outputDir,
                    ].join(" && "),
                    spawnSyncOptions,
                  );
                } catch (error) {
                  console.error("tryBundle error", error);
                  return false;
                }
                return true;
              },
            },
            command: [
              "sh",
              "-c",
              'echo "Docker build not supported. Please install esbuild."',
            ],
            image: cdk.DockerImage.fromRegistry("local"),
          },
        }),
      ],
      destinationBucket: cloudFrontStack.bucket,
      distribution: cloudFrontStack.distribution,
      distributionPaths: ["/*"],
    });
  }
}
