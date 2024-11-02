# Welcome to your CDK TypeScript project

AWS Architecture

![AWS Architecture](/2024/ci-cd-using-codepipeline-codebuild-and-codedeploy/assets/ci-cd-pipeline.png)

[AWS Architecture diagram file](https://app.diagrams.net/?title=ci-cd-pipeline#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2024%2Fci-cd-using-codepipeline-codebuild-and-codedeploy%2Fassets%2Fci-cd-pipeline.drawio)

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Setup Dev Environment

In GitHub, create a personal access tokens (classic), selecting the `repo` and `admin:repo_hook` scopes.

Run the following command, replacing `GITHUB_ACCESS_TOKEN` with the secret from the previous step and `REGION` with the appropriate AWS region the project will run in.

```bash
aws secretsmanager create-secret \ 
  --name github-oauth-token \ 
  --description "Github access token for cdk" \ 
  --secret-string GITHUB_ACCESS_TOKEN \ 
  --region REGION
```

This assumes that repo is `sample-python-web-app` and the owner is `danielwohlgemuth`. If that's not the case, update the values in the GitHubSourceAction configuration in [ci-cd-using-codepipeline-codebuild-and-codedeploy-stack.ts](/2024/ci-cd-using-codepipeline-codebuild-and-codedeploy/lib/ci-cd-using-codepipeline-codebuild-and-codedeploy-stack.ts).

If you plan to use EC2 Instance Connect to log in to the server and deploy this project in a region other then `us-east-2`, please update the prefix list Id. You can find the prefix list Id in the `VPC` service under the `Managed prefix lists` section.

Initialize the CDK toolkit stack in AWS

```bash
cdk bootstrap
````

Deploy the stack into AWS

```bash
cdk deploy
```

Delete the stack from AWS

```bash
cdk destroy
```