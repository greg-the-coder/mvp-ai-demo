#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DashboardStack } from "../lib/dashboard-stack";

const app = new cdk.App();

new DashboardStack(app, "EnvStatusDashboardStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  description: "Environment Status Dashboard - S3 + CloudFront static hosting",
});
