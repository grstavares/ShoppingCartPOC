/* tslint:disable no-implicit-dependencies */
import { AWSError, DynamoDB } from 'aws-sdk';

/* tslint:disable no-submodule-imports */
import { AttributeDefinitions, CreateTableInput, CreateTableOutput, KeySchema } from 'aws-sdk/clients/dynamodb';

import dynamodbLocal = require('dynamodb-localhost');

export interface LocalDynamoConfiguration {
    port: number;
    tableNames: string[];
    tableKeys: KeySchema[];
    tableAttributes: AttributeDefinitions[];
}

export class DynamoDBMock {

    public instancePort = 0;
    public rawDynamo: DynamoDB;
    public docClient: DynamoDB.DocumentClient;

    /* tslint:disable no-unsafe-any */
    constructor() { dynamodbLocal.install(); }

    public async start(config: LocalDynamoConfiguration): Promise<boolean[]> {

        this.instancePort = config.port > 0 ? config.port : 8000;
        dynamodbLocal.start({port: this.instancePort, inMemory: true, sharedDb: true});

        const options = {
            accessKeyId: 'MOCK_ACCESS_KEY_ID',
            convertEmptyValues: true,
            endpoint: `http://localhost:${this.instancePort}`,
            region: 'localhost',
            secretAccessKey: 'MOCK_SECRET_ACCESS_KEY',
        };

        this.rawDynamo = new DynamoDB(options);
        this.docClient = new DynamoDB.DocumentClient(options);

        const tableCount = config.tableNames.length;

        const promises: Array<Promise<boolean>> = [];

        let i: number;
        for (i = 0; i < tableCount; i++) {

            const createTable: CreateTableInput = {
                AttributeDefinitions: config.tableAttributes[i],
                KeySchema: config.tableKeys[i],
                ProvisionedThroughput: { ReadCapacityUnits: 50, WriteCapacityUnits: 50 },
                TableName: config.tableNames[i],
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

}
