using System.Collections.Generic;
using Amazon.CDK;
using Amazon.CDK.AWS.CloudFront;
using Amazon.CDK.AWS.CloudFront.Origins;
using Amazon.CDK.AWS.CodeBuild;
using Amazon.CDK.AWS.IAM;
using Amazon.CDK.AWS.S3;
using Constructs;

namespace Cdk
{
    public class CdkStack : Stack
    {
        internal CdkStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
        {
            // S3
            var bucket = new Bucket(this, "Frontend", new BucketProps
            {
                RemovalPolicy = RemovalPolicy.DESTROY,
                AutoDeleteObjects = true,
            });

            // CloudFront
            var distribution = new Distribution(this, "Distribution", new DistributionProps
            {
                DefaultBehavior = new BehaviorOptions
                {
                    Origin = S3BucketOrigin.WithOriginAccessControl(bucket),
                },
                DefaultRootObject = "index.html",
                ErrorResponses = new[] { new ErrorResponse {
                    HttpStatus = 403,
                    ResponseHttpStatus = 200,
                    ResponsePagePath = "/index.html",
                    Ttl = Duration.Minutes(30)
                } },
            });

            // CodeBuild
            var gitHubSource = Source.GitHub(new GitHubSourceProps
            {
                Owner = "danielwohlgemuth",
                Repo = "experiments",
                Webhook = true,
                WebhookFilters = new[]
                {
                    FilterGroup
                        .InEventOf(EventAction.PUSH)
                        .AndBranchIs("main")
                        .AndFilePathIs("2024/blazor-todo-list/frontend/.*"),
                },
                CloneDepth = 1,
            });

            var buildSpec = BuildSpec.FromObject(new Dictionary<string, object> {
                { "version", 0.2 },
                { "phases", new Dictionary<string, object> {
                    { "install", new Dictionary<string, object> {
                        { "on-failure", "ABORT" },
                        { "commands", new[] {
                            "curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel STS",
                            "dotnet --list-sdks",
                            "dotnet new globaljson --sdk-version 9.0.101",
                            "dotnet --version",
                        } },
                    }},
                    { "build", new Dictionary<string, object> {
                        { "on-failure", "ABORT" },
                        { "commands", new[] {
                            "cd 2024/blazor-todo-list/frontend",
                            "DOTNET_CLI_TELEMETRY_OPTOUT=1 dotnet publish -o output",
                        } },
                    }},
                    { "post_build", new Dictionary<string, object> {
                        { "on-failure", "ABORT" },
                        { "commands", new[] {
                            $"aws s3 cp output/wwwroot/ s3://{bucket.BucketName}/ --recursive",
                        } },
                    }},
                }},
            });

            var project = new Project(this, "Project", new ProjectProps
            {
                ProjectName = "blazor-todo-list",
                // Leave the line saying `Source = gitHubSource,` commented when deploying the CDK stack for the first time.
                // Uncomment and redeploy it after the first deployment was successful.
                // Source = gitHubSource,
                BuildSpec = buildSpec,
            });

            var policyStatement = new PolicyStatement(new PolicyStatementProps
            {
                Effect = Effect.ALLOW,
                Actions = new[]
                {
                    "codeconnections:GetConnection",
                    "codeconnections:GetConnectionToken",
                    "s3:PutObject",
                },
                Resources = new[]
                {
                    "arn:aws:codeconnections:*:*:connection/*",
                    $"arn:aws:s3:::{bucket.BucketName}",
                    $"arn:aws:s3:::{bucket.BucketName}/*",
                },
            });
            project.AddToRolePolicy(policyStatement);

            new CfnOutput(this, "CloudFrontURL", new CfnOutputProps
            {
                ExportName = "CloudFrontURL",
                Value = distribution.DistributionDomainName,
            });
        }
    }
}
