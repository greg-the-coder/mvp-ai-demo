import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import * as path from "path";

export interface StaticHostingStackProps extends cdk.StackProps {
  /** Environment name (e.g. 'dev', 'staging', 'prod') */
  envName: string;
  /** Path to the built site assets directory (e.g. '../dist'). If provided, assets are deployed to S3. */
  siteAssetsPath?: string;
}

export class StaticHostingStack extends cdk.Stack {
  public readonly distribution: cloudfront.Distribution;
  public readonly siteBucket: s3.Bucket;
  public readonly deploymentRole: iam.Role;

  constructor(scope: Construct, id: string, props: StaticHostingStackProps) {
    super(scope, id, props);

    const { envName, siteAssetsPath } = props;

    // ─── S3 Bucket for Static Site ──────────────────────────────────────────────
    this.siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: `env-status-dashboard-${envName}-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy:
        envName === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: envName !== "prod",
      versioned: envName === "prod",
    });

    // ─── CloudFront Distribution ────────────────────────────────────────────────
    this.distribution = new cloudfront.Distribution(this, "Distribution", {
      comment: `Environment Status Dashboard (${envName})`,
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(
          this.siteBucket
        ),
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        compress: true,
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
      minimumProtocolVersion:
        cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });

    // ─── IAM Deployment Role ────────────────────────────────────────────────────
    this.deploymentRole = new iam.Role(this, "DeploymentRole", {
      roleName: `env-status-dashboard-deploy-${envName}`,
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal("codebuild.amazonaws.com"),
        new iam.AccountRootPrincipal()
      ),
      description: `Deployment role for Environment Status Dashboard (${envName})`,
    });

    // S3 deployment permissions
    this.deploymentRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "S3DeployAccess",
        effect: iam.Effect.ALLOW,
        actions: [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ],
        resources: [
          this.siteBucket.bucketArn,
          `${this.siteBucket.bucketArn}/*`,
        ],
      })
    );

    // CloudFront invalidation permissions
    this.deploymentRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "CloudFrontInvalidation",
        effect: iam.Effect.ALLOW,
        actions: ["cloudfront:CreateInvalidation"],
        resources: [
          `arn:aws:cloudfront::${this.account}:distribution/${this.distribution.distributionId}`,
        ],
      })
    );

    // ─── S3 Deployment (when site assets path is provided) ──────────────────────
    if (siteAssetsPath) {
      const resolvedAssetsPath = path.resolve(siteAssetsPath);
      new s3deploy.BucketDeployment(this, "DeploySiteAssets", {
        sources: [s3deploy.Source.asset(resolvedAssetsPath)],
        destinationBucket: this.siteBucket,
        distribution: this.distribution,
        distributionPaths: ["/*"],
        cacheControl: [
          s3deploy.CacheControl.setPublic(),
          s3deploy.CacheControl.maxAge(cdk.Duration.days(365)),
          s3deploy.CacheControl.immutable(),
        ],
        prune: true,
      });
    }

    // ─── Outputs ────────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, "BucketName", {
      value: this.siteBucket.bucketName,
      description: "S3 bucket name for static assets",
      exportName: `${envName}-DashboardBucketName`,
    });

    new cdk.CfnOutput(this, "DistributionId", {
      value: this.distribution.distributionId,
      description: "CloudFront distribution ID",
      exportName: `${envName}-DashboardDistributionId`,
    });

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: this.distribution.distributionDomainName,
      description: "CloudFront distribution domain name",
      exportName: `${envName}-DashboardDomainName`,
    });

    new cdk.CfnOutput(this, "SiteUrl", {
      value: `https://${this.distribution.distributionDomainName}`,
      description: "Dashboard URL",
    });

    new cdk.CfnOutput(this, "DeploymentRoleArn", {
      value: this.deploymentRole.roleArn,
      description: "ARN of the deployment IAM role",
      exportName: `${envName}-DashboardDeployRoleArn`,
    });
  }
}
