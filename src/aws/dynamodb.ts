/* tslint:disable:no-implicit-dependencies */
import { AWSError, DynamoDB } from 'aws-sdk';
import { NoSQLTable } from '../common/backend';
import { APIGatewayResponse, ServiceError } from './../common/types.d';

/* tslint:disable:no-var-requires */
const AWSXRay = require('aws-xray-sdk');

export class DynamoDBTable implements NoSQLTable {

    private readonly dynamoDB: DynamoDB;

    constructor(private readonly tableName: string, dynamodb?: DynamoDB) {

        /* tslint:disable:no-unsafe-any */
        this.dynamoDB = (dynamodb === null || dynamodb == undefined) ? AWSXRay.captureAWSClient(new DynamoDB()) : dynamodb;

    }

    public async getItem(keys: {[key: string]: any}): Promise<Object> {

        const parsedKeys = this.marshalObject(keys);
        const getItemParams: DynamoDB.GetItemInput = { Key: parsedKeys, TableName: this.tableName, ReturnConsumedCapacity: 'TOTAL' };

        return new Promise((resolve: Function, reject: Function) => {

            this.dynamoDB.getItem(getItemParams).promise()
            .then((result) => resolve((result.Item !== null && result.Item !== undefined) ? this.unmarshalObject(result.Item) : null))
            .catch((error) => reject(this.parseAWSError(error, {type: 'table', name: this.tableName})));

        });

    }

    public async queryItemByHashKey(keys: {[key: string]: any}): Promise<Object[]> {

        const queryKeys = Object.keys(keys);
        const hashKeyName = { '#keyname': queryKeys[0] };
        const hashKeyValue = { ':keyvalue': keys[queryKeys[0]] };
        const parsedKeyValue = this.marshalObject(hashKeyValue);

        const queryItemParams: DynamoDB.QueryInput = {
            ExpressionAttributeNames: hashKeyName,
            ExpressionAttributeValues: parsedKeyValue,
            KeyConditionExpression: '#keyname = :keyvalue',
            ReturnConsumedCapacity: 'TOTAL',
            TableName: this.tableName,
        };

        return new Promise((resolve: Function, reject: Function) => {

            this.dynamoDB.query(queryItemParams).promise()
            .then((result) => {

                const dynamoItems = result.Items;
                const objectItems = dynamoItems.map((item, index, array) => this.unmarshalObject(item));
                resolve(objectItems);

            }).catch((error) => reject(this.parseAWSError(error, {type: 'table', name: this.tableName})));

        });

    }

    public async putItem(keys: { [key: string]: any }, object: Object): Promise<boolean> {

        const payload = this.marshalObject(object);
        const putObject: DynamoDB.PutItemInput = { TableName: this.tableName, Item: payload, ReturnConsumedCapacity: 'TOTAL' };

        return new Promise((resolve: Function, reject: Function) => {

            this.dynamoDB.putItem(putObject).promise()
            .then((result) => resolve(true))
            .catch((error) => reject(this.parseAWSError(error, {type: 'table', name: this.tableName})));

        });

    }

    public async deleteItems(keys: { [key: string]: any }): Promise<boolean> {

        const parsedKeys = this.marshalObject(keys);
        const deleteItemParams: DynamoDB.DeleteItemInput = { Key: parsedKeys, TableName: this.tableName, ReturnConsumedCapacity: 'TOTAL' };

        return new Promise((resolve: Function, reject: Function) => {

            this.dynamoDB.deleteItem(deleteItemParams).promise()
            .then((result) => resolve(true))
            .catch((error) => reject(this.parseAWSError(error, {type: 'table', name: this.tableName})));

        });

    }

    private marshalObject(object: Object): DynamoDB.AttributeMap {

        const marshsalled = DynamoDB.Converter.marshall(object, { convertEmptyValues: true, wrapNumbers: true });
        return marshsalled;

    }

    private unmarshalObject(object: DynamoDB.AttributeMap): Object {

        const unmarshsalled = DynamoDB.Converter.unmarshall(object, { convertEmptyValues: true, wrapNumbers: false });
        return unmarshsalled;

    }

    private parseAWSError(error: AWSError, resource: { type: string; name: string }): ServiceError {

        let errorCode  = 'undefined';
        let httpCode = 500;
        const resourceDescription = JSON.stringify(resource);

        switch (error.code.toLowerCase()) {
            case 'networkingerror':
                errorCode = 'NetworkError';
                httpCode = 500;
                break;
            case 'missingrequiredparameter':
                errorCode = 'InvalidObjectBody';
                httpCode = 400;
                break;
            default:
                console.log('AWSError not identified!');
                console.log(error);
        }

        return {code: errorCode, httpStatusCode: httpCode, resource: resourceDescription, payload: error};

    }

}
