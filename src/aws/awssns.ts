/* tslint:disable:no-implicit-dependencies */
import { AWSError, SNS } from 'aws-sdk';
import { MessageBus } from '../common/backend';
import { AwsSnsMessage } from './../common/types.d';
import { AWSErrorParser } from './awserrorparser';

/* tslint:disable:no-var-requires */
const AWSXRay = require('aws-xray-sdk');

export class AWSTopic implements MessageBus {

    constructor(private readonly arn: string) { }

    public async publish(message: AwsSnsMessage): Promise<string> {

        return new Promise((resolve: Function, reject: Function) => {

            /* tslint:disable: no-unsafe-any */
            const sns = AWSXRay.captureAWSClient(new SNS());
            const snsEvent: SNS.PublishInput = { Message: JSON.stringify(message), TopicArn: this.arn };

            sns.publish(snsEvent, (error: AWS.AWSError, data: AWS.SNS.PublishResponse) => {

                if (error !== null && error !== undefined) { reject(AWSErrorParser.parseAWSError(error, {type: 'topic', name: this.arn}));
                } else { resolve(data.MessageId); }

            });

        });
    }

}
