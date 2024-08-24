#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Domain } from '../lib/domain';
import { WebsiteStack } from '../lib/www-site-stack';
import { Certs } from '../lib/certs';

const app = new cdk.App();
const accountId = process.env.AWS_ACCT_ID ?? '997977235115';

const env = {
  account: accountId,
  region: process.env.AWS_REGION ?? 'us-east-1',
}

const domain = new Domain(app, 'Domain', { env: env });
const certs = new Certs(app, 'Certs', { env: env });
certs.addDependency(domain)
const website = new WebsiteStack(app, 'Website', { env: env });
website.addDependency(certs)