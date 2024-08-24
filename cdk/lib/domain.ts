import {
    Stack,
    StackProps,
    aws_certificatemanager as acm,
    aws_route53 as r53,
    aws_ssm as ssm,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class Domain extends Stack {
    constructor(scope: Construct, id: string, props: StackProps,) {
        super(scope, id);

        //Domain
        const zoneName = `tokillc.com`;
        const domainZone = new r53.PublicHostedZone(this, `${zoneName}-domain`, { zoneName: zoneName });

        new ssm.StringParameter(this, 'tokillc-hostedzoneid', {
            description: 'Hosted Zone ID',
            parameterName: 'tokillc-hostedzoneid',
            stringValue: domainZone.hostedZoneId,
        });

        new ssm.StringParameter(this, 'tokillc-hostedzonename', {
            description: 'Hosted Zone Name',
            parameterName: 'tokillc-hostedzonename',
            stringValue: domainZone.zoneName,
        });
    }
}