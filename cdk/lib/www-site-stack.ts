/**
 * This file is the Stack for the actual random pet app itself. It declares the
 * needed resources which cdk-pipeline-stack.ts then deploys.
 * A starting version of this file is created by the cdk init command.
 *
 * Import required modules for CDK using ES6-style import directives per
 * https://docs.aws.amazon.com/cdk/latest/guide/work-with-cdk-typescript.html
 */
import {
  Duration,
  RemovalPolicy,
  Stack,
  StackProps
} from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  aws_certificatemanager as acm,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as cloudfrontorigin,
  aws_route53 as route53,
  aws_s3 as s3,
  aws_s3_deployment as s3deploy,
  aws_ssm as ssm,
  aws_route53_patterns as patterns
} from "aws-cdk-lib";

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const websiteBucketName = "www.tokillc.com";

    const certArn = ssm.StringParameter.valueForStringParameter(
      this,
      "tokillc-wildcardcertarn"
    );
    const zoneName = ssm.StringParameter.valueForStringParameter(
      this,
      "tokillc-hostedzonename"
    );
    const hostedZoneId = ssm.StringParameter.valueForStringParameter(
      this,
      "tokillc-hostedzoneid"
    );


    // Create S3 buckets to be used
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      bucketName: websiteBucketName,
    });
    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
      sources: [s3deploy.Source.asset("../src")],
      destinationBucket: websiteBucket,
      retainOnDelete: false,
    });

    const websiteCert = acm.Certificate.fromCertificateArn(
      this,
      "Certificate",
      certArn
    );

    const previewCachePolicy = new cloudfront.CachePolicy(
      this,
      "previewCachePolicy",
      {
        defaultTtl: Duration.minutes(30),
        minTtl: Duration.minutes(25),
        maxTtl: Duration.minutes(35),
        enableAcceptEncodingBrotli: true,
        enableAcceptEncodingGzip: true,
        headerBehavior:
          cloudfront.CacheHeaderBehavior.allowList("authorization"),
      }
    );

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: new cloudfrontorigin.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: previewCachePolicy,
        compress: true,
      },
      domainNames: [websiteBucketName],
      certificate: websiteCert,
      defaultRootObject: "index.html",
    });

    // DNS for the website using existing hosted zone
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "Zone",
      {
        zoneName,
        hostedZoneId,
      }
    );

    new route53.CnameRecord(this, "DistributionCname", {
      zone: hostedZone,
      recordName: 'www',
      // Switch to CloudFlare DNS name
      domainName: distribution.distributionDomainName,
      ttl: Duration.seconds(300),
    });

    new patterns.HttpsRedirect(this, 'ApexRedirect', {
      recordNames: ['tokillc.com'], // Your apex domain
      targetDomain: 'www.tokillc.com', // The www subdomain
      zone: hostedZone,
    });

  }
}
