#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CloudFrontStack } from "../lib/cloudfront-stack";
import { RestApiStack } from "../lib/rest-api-stack";
import { CognitoStack } from "../lib/cognito-stack";
import { DynamoDBStack } from "../lib/dynamodb-stack";
import { BucketDeploymentStack } from "../lib/bucket-deployment-stack";
import {
  CloudFormationClient,
  DescribeStacksCommand,
} from "@aws-sdk/client-cloudformation";

const fetchApiUrl = async () => {
  const client = new CloudFormationClient();
  const command = new DescribeStacksCommand({ StackName: "RestApiStack" });
  const response = await client.send(command);

  if (!response.Stacks) {
    throw new Error("Stack not found");
  }

  return response.Stacks[0].Outputs?.find(
    (output) => output.ExportName === "apiURL",
  )?.OutputValue;
};

const app = new cdk.App();

new DynamoDBStack(app, "DynamoDBStack");
const cognitoStack = new CognitoStack(app, "CognitoStack");
const restApiStack = new RestApiStack(app, "RestApiStack", cognitoStack);
restApiStack.addDependency(cognitoStack);
const cloudfrontStack = new CloudFrontStack(app, "CloudFrontStack");

createBucketDeploymentStack();
async function createBucketDeploymentStack() {
  const apiUrl = (await fetchApiUrl()) || "";
  const bucketDeploymentStack = new BucketDeploymentStack(
    app,
    "BucketDeploymentStack",
    cloudfrontStack,
    apiUrl,
  );
  bucketDeploymentStack.addDependency(cloudfrontStack);
  bucketDeploymentStack.addDependency(restApiStack);
}
