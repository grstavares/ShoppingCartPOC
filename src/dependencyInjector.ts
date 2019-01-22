/* tslint:disable: no-implicit-dependencies */
import { Context } from 'aws-lambda';
import { MessageBus, MetricBus, NoSQLTable } from './common/backend';

export class DependencyInjector {

    constructor(private readonly context: Context) { }

    public getNoSQLTable(): NoSQLTable  { return null; }

    public getMessageBus(): MessageBus { return null; }

    public getMetricBus(): MetricBus { return null; }

}
