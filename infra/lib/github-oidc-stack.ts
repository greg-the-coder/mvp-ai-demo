import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class GitHubOidcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // -------------------------------------------------------
    // IAM OIDC Identity Provider for GitHub Actions
    // -------------------------------------------------------
    const oidcProvider = new iam.OpenIdConnectProvider(this, 'GitHubOidcProvider', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    // -------------------------------------------------------
    // IAM Role — assumed by GitHub Actions via OIDC
    // -------------------------------------------------------
    const role = new iam.Role(this, 'GitHubActionsRole', {
      roleName: 'github-actions-env-dashboard',
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn, {
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
        StringLike: {
          'token.actions.githubusercontent.com:sub': 'repo:greg-the-coder/mvp-ai-demo:*',
        },
      }),
      inlinePolicies: {
        CdkDeployPolicy: new iam.PolicyDocument({
          statements: [
            // a) Assume CDK bootstrap roles
            new iam.PolicyStatement({
              sid: 'AssumeCdkBootstrapRoles',
              effect: iam.Effect.ALLOW,
              actions: ['sts:AssumeRole'],
              resources: ['arn:aws:iam::*:role/cdk-hnb659fds-*'],
            }),
            // b) CloudFormation — needed by CDK CLI directly
            new iam.PolicyStatement({
              sid: 'CloudFormationReadAccess',
              effect: iam.Effect.ALLOW,
              actions: [
                'cloudformation:DescribeStacks',
                'cloudformation:GetTemplate',
                'cloudformation:DescribeStackEvents',
              ],
              resources: ['*'],
            }),
            // c) SSM Parameter — CDK bootstrap version check
            new iam.PolicyStatement({
              sid: 'SsmBootstrapVersionCheck',
              effect: iam.Effect.ALLOW,
              actions: ['ssm:GetParameter'],
              resources: ['arn:aws:ssm:*:*:parameter/cdk-bootstrap/*'],
            }),
            // d) S3 CDK assets bucket — for asset publishing
            new iam.PolicyStatement({
              sid: 'S3CdkAssetsBucket',
              effect: iam.Effect.ALLOW,
              actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket'],
              resources: ['arn:aws:s3:::cdk-hnb659fds-assets-*'],
            }),
          ],
        }),
      },
    });

    // -------------------------------------------------------
    // CloudFormation Outputs
    // -------------------------------------------------------
    new cdk.CfnOutput(this, 'GitHubActionsRoleArn', {
      value: role.roleArn,
      description: 'ARN of the IAM role for GitHub Actions (set as AWS_ROLE_ARN secret)',
    });

    new cdk.CfnOutput(this, 'OidcProviderArn', {
      value: oidcProvider.openIdConnectProviderArn,
      description: 'ARN of the GitHub OIDC identity provider',
    });
  }
}
