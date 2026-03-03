#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StaticHostingStack } from "../lib/static-hosting-stack";

const app = new cdk.App();

const envName = app.node.tryGetContext("envName") || "dev";

const envConfig: Record<string, { account?: string; region?: string }> = {
  dev: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  staging: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  prod: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
};

const config = envConfig[envName] || envConfig.dev;

new StaticHostingStack(app, `EnvStatusDashboard-${envName}`, {
  envName,
  env: {
    account: config.account,
    region: config.region,
  },
  tags: {
    Project: "EnvironmentStatusDashboard",
    Environment: envName,
    ManagedBy: "CDK",
  },
});
