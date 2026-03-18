import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';

export class EnvDashboardStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -------------------------------------------------------
    // S3 Bucket — static SPA hosting (private, CloudFront only)
    // -------------------------------------------------------
    const bucket = new s3.Bucket(this, 'DashboardBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // -------------------------------------------------------
    // Lambda Function — API backend
    // -------------------------------------------------------
    const apiFunction = new lambda.Function(this, 'DeploymentsFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'backend', 'src')),
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      description: 'Environment Status Dashboard API handler',
    });

    // -------------------------------------------------------
    // API Gateway REST API
    // -------------------------------------------------------
    const api = new apigateway.RestApi(this, 'DashboardApi', {
      restApiName: 'env-dashboard-api',
      description: 'Environment Status Dashboard REST API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'OPTIONS'],
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(apiFunction);

    // /api resource
    const apiResource = api.root.addResource('api');

    // GET /api/deployments
    const deploymentsResource = apiResource.addResource('deployments');
    deploymentsResource.addMethod('GET', lambdaIntegration);

    // GET /api/deployments/{serviceId}
    const singleDeploymentResource = deploymentsResource.addResource('{serviceId}');
    singleDeploymentResource.addMethod('GET', lambdaIntegration);

    // GET /api/health
    const healthResource = apiResource.addResource('health');
    healthResource.addMethod('GET', lambdaIntegration);

    // -------------------------------------------------------
    // CloudFront Distribution
    // -------------------------------------------------------
    const distribution = new cloudfront.Distribution(this, 'DashboardDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.RestApiOrigin(api),
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(0),
        },
      ],
    });

    // -------------------------------------------------------
    // S3 BucketDeployment — deploy built frontend to S3
    // -------------------------------------------------------
    new s3deploy.BucketDeployment(this, 'DeployDashboard', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '..', '..', 'dashboard', 'dist'))],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // -------------------------------------------------------
    // CloudFormation Outputs
    // -------------------------------------------------------
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'URL for the Environment Status Dashboard',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL for the Dashboard REST API',
    });
  }
}
