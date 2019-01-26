/* tslint:disable:no-implicit-dependencies */
import { CloudWatch, AWSError } from 'aws-sdk';
import { MetricBus } from '../common';
import { InfrastructureMetric } from '../common/types';
import { AWSParser } from './parser';

/* tslint:disable:no-var-requires */
// var AWSXRay = require('aws-xray-sdk');

export class AWSMetricPublisher implements MetricBus {

    private readonly cloudwatch: CloudWatch;

    constructor() {

        this.cloudwatch = new CloudWatch();

    }

    public async publish(metric: InfrastructureMetric): Promise<boolean> {

        return new Promise((resolve: Function, reject: Function) => {

            const metricData: CloudWatch.PutMetricDataInput = {
                Namespace: 'SoppingCartPOC',    // MUST BE MOVED TO A STATIC GLOBAL VALUE
                MetricData: [{
                    MetricName: metric.name,
                    Dimensions: metric.dimensions,
                    Timestamp: metric.timestamp,
                    Value: metric.value,
                    Unit: 'Count',
                    StorageResolution: 60,
                }],
            };

            this.cloudwatch.putMetricData(metricData, (error: AWSError, data) => {

                if (error !== null && error !== undefined) {reject(AWSParser.parseAWSError(error, {type: 'metric', name: metric.name}));
                } else {resolve(true); }

            });

        });

    }

}
