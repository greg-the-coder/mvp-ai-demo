#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DashboardStack } from "../lib/dashboard-stack";

const app = new cdk.App();
new DashboardStack(app, "EnvironmentDashboardStack");
