/* tslint:disable: no-implicit-dependencies */
import { Context } from 'aws-lambda';
import { DependencyInjector } from '../../src/dependencyInjector';
import { MessageBus, MetricBus, NoSQLTable } from '../../src/common/backend';

/* tslint:disable no-submodule-imports */
import { DynamoDBTable } from '../../src/aws/dynamodb';
import { DynamoDB } from 'aws-sdk';

export class DependencyInjectorMock extends DependencyInjector {

    constructor(context: Context, private readonly dynamoDB: DynamoDB, private readonly tableName: string) { super(context); }

    public async getNoSQLTable(): Promise<NoSQLTable> {

        return  new DynamoDBTable(this.tableName, this.dynamoDB);

    }

    public async getMessageBus(): Promise<MessageBus> { return Promise.reject(); }

    public async getMetricBus(): Promise<MetricBus> { return Promise.reject(); }

    public async injectItemOnTable(keys: { [key: string]: any }, object: Object): Promise<boolean> {

        return this.getNoSQLTable()
        .then(async (table) => table.putItem(keys, object));

    }

}

export class ErrorNoSQLTable implements NoSQLTable {

    public async getItem(keys: {[key: string]: any}): Promise<Object> { return Promise.reject(); }
    public async queryItemByHashKey(keys: {[key: string]: any}): Promise<Object[]> { return Promise.reject(); }
    public async putItem(keys: { [key: string]: any }, object: Object): Promise<boolean> { return Promise.reject(); }
    public async deleteItems(keys: { [key: string]: any }): Promise<boolean> { return Promise.reject(); }

}
