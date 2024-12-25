# CI/CD using CodePipeline, CodeBuild, and CodeDeploy

AWS Architecture

![AWS Architecture](/2024/ci-cd-using-codepipeline-codebuild-and-codedeploy/assets/ci-cd-pipeline.drawio.png)

[AWS Architecture diagram file](https://app.diagrams.net/?title=ci-cd-pipeline#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2024%2Fci-cd-using-codepipeline-codebuild-and-codedeploy%2Fassets%2Fci-cd-pipeline.drawio)

Code Coverage Summary

![codebuild report](/2024/ci-cd-using-codepipeline-codebuild-and-codedeploy/assets/codebuild-report.png)

## Cost

This project uses [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) to store the GitHub access token, which has a cost of **$0.40 per secret per month**. For secrets that are stored for less than a month, the price is prorated based on the number of hours, so make sure to delete the secret as soon as you are done with the project.

## Setup Dev Environment

In GitHub, create a personal access tokens (classic), selecting the `repo` and `admin:repo_hook` scopes.

Run the following command, replacing `GITHUB_ACCESS_TOKEN` with the secret from the previous step and `REGION` with the appropriate AWS region the project will run in.

```bash
aws secretsmanager create-secret \
  --name "github-oauth-token" \
  --description "Github access token for CI/CD" \
  --secret-string "GITHUB_ACCESS_TOKEN" \
  --region "REGION"
```

This assumes that repo is `sample-python-web-app` and the owner is `danielwohlgemuth`. If that's not the case, update the values in the GitHubSourceAction configuration in [ci-cd-using-codepipeline-codebuild-and-codedeploy-stack.ts](/2024/ci-cd-using-codepipeline-codebuild-and-codedeploy/lib/ci-cd-using-codepipeline-codebuild-and-codedeploy-stack.ts).

If you plan to use EC2 Instance Connect to log in to the server and deploy this project in a region other then `us-east-2`, please update the prefix list Id. You can find the prefix list Id in the `VPC` service under the `Managed prefix lists` section.

Initialize the CDK toolkit stack in AWS

```bash
cdk bootstrap
````

Deploy the stack to AWS

```bash
cdk deploy
```

Delete the stack from AWS

```bash
cdk destroy
```

Delete the secret

```bash
aws secretsmanager delete-secret \
    --secret-id github-oauth-token \
    --recovery-window-in-days 7
```