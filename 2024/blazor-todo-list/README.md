# Blazor To-Do List

![Blazor To-Do List](/2024/blazor-todo-list/assets/blazor-todo-list.png)

This project uses Blazor, a frontend web framework similar in functionality to React and other modern frameworks, but where you can write the code using C#/.NET instead of JavaScript. It's based on [Build a to-do list with Blazor](https://learn.microsoft.com/en-us/training/modules/build-blazor-todo-list/) with some UI adjustments and also includes infrastructure code to deploy it on AWS.

AWS Architecture

![AWS Architecture](/2024/blazor-todo-list/assets/blazor-todo-list.drawio.png)

[AWS Architecture diagram file](https://app.diagrams.net/?title=blazor-todo-list#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fdanielwohlgemuth%2Fexperiments%2Frefs%2Fheads%2Fmain%2F2024%2Fblazor-todo-list%2Fassets%2Fblazor-todo-list.drawio)

Technologies used:
- AWS
  - CloudFront
  - S3
  - CodeBuild
  - CloudFormation
  - CDK
- C#
  - Blazor

## Pre-requisites

- AWS CLI
- AWS CDK CLI
- .NET 9.0
- Python 3 (optional)

### Pricing

The CodeBuild AWS Free Tier includes 100 total build minutes per month with the general1.small instance type using on-demand Amazon EC2. See [CodeBuild pricing](https://aws.amazon.com/codebuild/pricing/).

Without the free tier, each build minute with a general1.small instance costs $0.005. Each build takes around 2 minutes to complete, so the cost would be **$0.01 per build**.

## Setup dev environment

To start the frontend for live development, run the following command.

```bash
dotnet watch run --project frontend
```

After development is done, run the next command to compile it into static files that can be uploaded to a web server.

```bash
dotnet publish frontend -o frontend/output
```

To verify the previous output, run the following command.

```bash
python3 -m http.server --directory frontend/output/wwwroot/
```

## Setup AWS

### Create GitHub connection

1. In AWS, go to CodeBuild -> Settings -> Connections
2. Click `Create connection`
3. Select `GitHub` as the provider and set the name to `blazor-todo-list`
4. In AWS, click `Connect`
5. Copy the ARN of the connection

6. Run the following command. Replace `CONNECTION_ARN_HERE` with the ARN from the previous command.

```bash
aws codebuild import-source-credentials --auth-type CODECONNECTIONS --server-type GITHUB --token CONNECTION_ARN_HERE
```

To get the connection ARN through the CLI, use this command.

```bash
aws codebuild list-source-credentials --query "sourceCredentialsInfos[?serverType=='GITHUB' && authType=='CODECONNECTIONS'].arn" --output text
```

### Deploy using CDK

Deploy 

```bash
cd cdk
dotnet build src
cdk deploy
```

After the first deployment succeeds, uncomment `Source = gitHubSource,` in [cdk/src/Cdk/CdkStack.cs](/2024/blazor-todo-list/cdk/src/Cdk/CdkStack.cs), and run `cdk deploy` again.

This is a workaround to an issue I found while trying to CodeBuild through CDK. Without it, the CDK deploy failed with the following error message:
> CdkStack failed: Error: The stack named CdkStack failed to deploy: CREATE_FAILED (The following resource(s) failed to create: [ProjectC78D97AD]. ): Failed to call CreateWebhook, reason: Access denied to connection arn:aws:codeconnections:REGION:ACCOUNT_ID:connection/CONNECTION_ID (Service: AWSCodeBuild; Status Code: 400; Error Code: InvalidInputException; Request ID: Request_ID; Proxy: null)

### Build the frontend

After completing the previous section, there will be an output on the CLI saying `CdkStack.CloudFrontURL`, followed by the URL. If you try to access it at this point, you'll get an 403 Access Denied error, because the frontend hasn't been built yet and so the S3 bucket is still empty.

There are two ways to get the frontend to build:
- Push a new change to the repo
- Manually trigger a build

To manually start a build through the AWS Console, go to CodeBuild -> Build -> Build projects -> blazor-todo-list and click on `Start build`.

To trigger a build through the AWS CLI, use this.

```bash
aws codebuild start-build --project-name blazor-todo-list
```

After the build finishes, the frontend should be accessible at the CloudFront URL.
