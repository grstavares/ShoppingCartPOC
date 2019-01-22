/* tslint:disable: no-implicit-dependencies */
import { Context } from 'aws-lambda';
import { MessageBus, MetricBus, NoSQLTable } from './common/backend';

export class DependencyInjector {

    constructor(private readonly context: Context) { }

    public async getNoSQLTable(): Promise<NoSQLTable> { return Promise.reject(); }

    public async getMessageBus(): Promise<MessageBus> { return Promise.reject(); }

    public async getMetricBus(): Promise<MetricBus> { return Promise.reject(); }

}
