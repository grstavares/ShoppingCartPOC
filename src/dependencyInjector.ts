/* tslint:disable: no-implicit-dependencies */
import { Context } from 'aws-lambda';
import { MessageBus, MetricBus, NoSQLTable, BackendMetrics } from './common/backend';
import { ErrorBuilder } from './common/utilities';
import { ResponseBuilder, MetricBuilder } from '../../ConsultaniaPrev/ServerlessBackendAWS/services/empresa-service/src/utilities';
import { InfrastructureMetric } from './common/types';
import { DynamoDBTable } from './aws/dynamodb';

export enum DependencyInjectorError {
    DependencyNotAvailable = 'DependencyNotAvailable',
}

export class DependencyInjector {

    constructor(private readonly context: Context, private readonly traceId: string) { }

    public async getNoSQLTable(): Promise<NoSQLTable> {

        const tablename = process.env.DYNAMO_TABLE_NAME;
        if (tablename === null || tablename == undefined) {
            const error = ErrorBuilder.newError(DependencyInjectorError.DependencyNotAvailable, 'noSQLTable', {});
            const response = ResponseBuilder.internalError(error.code, this.traceId);
            const metric = new MetricBuilder(BackendMetrics.DependencyNotConfigured, 1).withResource(tablename).withResourceType('noSQLTable').build();

            console.log(error);
            return this.tryToPublishMetric(metric)
            .then(async (result) => Promise.reject(response))
            .catch(async (publishError) => Promise.reject(response));

        }

        return new DynamoDBTable(tablename);

    }

    public async getMessageBus(): Promise<MessageBus> { return Promise.reject(); }

    public async getMetricBus(): Promise<MetricBus> { return Promise.reject(); }

    private async tryToPublishMetric(metric: InfrastructureMetric): Promise<boolean> {

        return this.getMetricBus().then(async (metricbus) => metricbus.publish(metric));

    }

}
