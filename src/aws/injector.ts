/* tslint:disable: no-implicit-dependencies */
import { MessageBus, MetricBus, NoSQLTable, BackendMetrics, Logger, InputParser, DependencyInjector } from '../common/backend';
import { ErrorBuilder, ResponseBuilder, MetricBuilder } from '../common/utilities';
import { InfrastructureMetric } from '../common/types';
import { DynamoDBTable, AWSTopic, AWSMetricPublisher, AWSParser } from '.';
import { ConsoleLogger } from './consoleLogger';

export enum DependencyInjectorError {
    DependencyNotAvailable = 'DependencyNotAvailable',
    DependencyNotConfigured = 'DependencyNotConfigured',
}

export class AWSDependencyInjector implements DependencyInjector {

    // private readonly traceId: string;

    // constructor(private readonly context: Context) { this.traceId = context.awsRequestId; }
    constructor(private readonly traceId: string) { }

    public async getNoSQLTable(): Promise<NoSQLTable> {

        const tablename = process.env.DYNAMO_TABLE_NAME;
        if (tablename === null || tablename == undefined) {

            const error = ErrorBuilder.newError(DependencyInjectorError.DependencyNotConfigured, 'noSQLTable', {});
            const response = ResponseBuilder.internalError(error.code, this.traceId);
            const metric = new MetricBuilder(BackendMetrics.DependencyNotConfigured, 1).withResourceType('noSQLTable').build();

            console.log(error);
            return this.tryToPublishMetric(metric)
            .then(async (result) => Promise.reject(response))
            .catch(async (publishError) => Promise.reject(response));

        }

        return new DynamoDBTable(tablename);

    }

    public async getMessageBus(): Promise<MessageBus> {

        const topicarn = process.env.SNS_TOPIC_ARN;
        if (topicarn === null || topicarn == undefined) {

            const error = ErrorBuilder.newError(DependencyInjectorError.DependencyNotConfigured, 'SNSTopic', {});
            const response = ResponseBuilder.internalError(error.code, this.traceId);
            const metric = new MetricBuilder(BackendMetrics.DependencyNotConfigured, 1).withResourceType('SNSTopic').build();

            console.log(error);
            return this.tryToPublishMetric(metric)
            .then(async (result) => Promise.reject(response))
            .catch(async (publishError) => Promise.reject(response));

        }

        return new AWSTopic(topicarn);

    }

    public async getMetricBus(): Promise<MetricBus> {

        return new AWSMetricPublisher();

    }

    public getInputParser(event: any): InputParser {

        const appSyncIdentifier = 'AppSyncOperation';
        /* tslint:disable no-unsafe-any*/
        if (event[appSyncIdentifier] === null || event[appSyncIdentifier] == undefined) {
            return AWSParser.parseAPIGatewayEvent(event);
        } else { return AWSParser.parseAppSyncEvent(event); }

    }

    public getLogger(): Logger {

      const isInsideAWS = (process.env.LAMBDA_TASK_ROOT === null || process.env.LAMBDA_TASK_ROOT == undefined);
      return new ConsoleLogger(!isInsideAWS);

    }

    private async tryToPublishMetric(metric: InfrastructureMetric): Promise<boolean> {

        return this.getMetricBus().then(async (metricbus) => metricbus.publish(metric));

    }

}
