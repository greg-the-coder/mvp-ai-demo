#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EnvDashboardStack } from '../lib/env-dashboard-stack';

const app = new cdk.App();

new EnvDashboardStack(app, 'EnvDashboardStack', {
  env: { region: 'us-east-1' },
  description: 'Environment Status Dashboard - S3, CloudFront, Lambda, API Gateway',
});
