import {
    Stack,
    StackProps,
    aws_certificatemanager as acm,
    aws_route53 as r53,
    aws_ssm as ssm,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class Certs extends Stack {
    constructor(scope: Construct, id: string, props: StackProps,) {
        super(scope, id);
        // Cert
        // Top level
        const topZone = r53.PublicHostedZone.fromHostedZoneAttributes(this, 'TopZone', {
            hostedZoneId: ssm.StringParameter.valueForStringParameter(this, 'tokillc-hostedzoneid'),
            zoneName: ssm.StringParameter.valueForStringParameter(this, 'tokillc-hostedzonename'),
        });


        const accountCert = new acm.Certificate(this, `tokillc-certificate`, {
            domainName: `*.${topZone.zoneName}`,
            validation: acm.CertificateValidation.fromDns(topZone),
        });


        new ssm.StringParameter(this, 'tokillc-wildcardcertarn', {
            description: 'Hosted Zone Cert',
            parameterName: 'tokillc-wildcardcertarn',
            stringValue: accountCert.certificateArn,
        });
    }
}