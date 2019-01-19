import { Context } from 'aws-lambda';
import { NoSQLTable, MessageBus, MetricBus } from './common/backend';

export class DependencyInjector {

    constructor(private context: Context) { }

    getNoSQLTable(): NoSQLTable  { return null }
    
    getMessageBus(): MessageBus { return null }
    
    getMetricBus(): MetricBus { return null }

}