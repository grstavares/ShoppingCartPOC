/* tslint:disable no-implicit-dependencies */
import { AWSError, DynamoDB } from 'aws-sdk';

/* tslint:disable no-submodule-imports */
import { AttributeDefinitions, CreateTableInput, CreateTableOutput, KeySchema } from 'aws-sdk/clients/dynamodb';

import dynamodbLocal = require('dynamodb-localhost');

export interface LocalDynamoConfiguration {
    port?: number;
    tableNames: string[];
    tableKeys: KeySchema[];
    tableAttributes: AttributeDefinitions[];
}

export class DynamoDBMock {

    public instancePort = 0;
    public rawDynamo: DynamoDB;
    // public docClient: DynamoDB.DocumentClient;

    /* tslint:disable no-unsafe-any */
    constructor(private readonly config: LocalDynamoConfiguration) { dynamodbLocal.install(() => { return; }); }

    public async start(): Promise<boolean[]> {

        this.instancePort = this.config.port > 0 ? this.config.port : 8000;
        dynamodbLocal.start({port: this.instancePort, inMemory: true, sharedDb: true});

        this.rawDynamo = this.getClient();

        const tableCount = this.config.tableNames.length;

        const promises: Array<Promise<boolean>> = [];

        let i: number;
        for (i = 0; i < tableCount; i++) {

            const createTable: CreateTableInput = {
                AttributeDefinitions: this.config.tableAttributes[i],
                KeySchema: this.config.tableKeys[i],
                ProvisionedThroughput: { ReadCapacityUnits: 50, WriteCapacityUnits: 50 },
                TableName: this.config.tableNames[i],
            };

            promises.push(new Promise((resolve, reject) => {
                this.rawDynamo.createTable(createTable, (error: AWSError, data: CreateTableOutput) => {
                    if (error !== null && error !== undefined) {reject(error);
                    } else {resolve(true); }
                });
            }));

        }

        return Promise.all(promises);

    }

    public stop() { dynamodbLocal.stop(this.instancePort); }

    public remove() { dynamodbLocal.remove(); }

    public async listDynamoTables(): Promise<string[]> {

        return new Promise((resolve, reject) => {

            const listTables: DynamoDB.ListTablesInput = {};
            this.rawDynamo.listTables(listTables, (error: AWSError, data) => {

                if (error === null && error == undefined) { resolve(data.TableNames);
                } else { reject(error); }

            });

        });

    }

    private getClient(): DynamoDB {

        const options = {
            accessKeyId: 'MOCK_ACCESS_KEY_ID',
            convertEmptyValues: true,
            endpoint: `http://localhost:${this.instancePort}`,
            region: 'localhost',
            secretAccessKey: 'MOCK_SECRET_ACCESS_KEY',
        };

        const rawDynamo = new DynamoDB(options);
        return rawDynamo;

    }

}
