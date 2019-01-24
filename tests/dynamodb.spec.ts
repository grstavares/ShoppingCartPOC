/* tslint:disable no-implicit-dependencies */
import { expect, should } from 'chai';

/* tslint:disable no-submodule-imports */
import { KeySchema, AttributeDefinitions } from 'aws-sdk/clients/dynamodb';
import { DynamoDBMock, LocalDynamoConfiguration } from './mockedDependencies/dynamoMock';

import { DynamoDBTable } from '../src/aws/dynamodb';

/* tslint:disable no-import-side-effect */
import 'mocha';

const tableNames = ['ShopingCart'];
const tableKeys: KeySchema[] = [ [{ AttributeName: 'cartId', KeyType: 'HASH'}, { AttributeName: 'sku', KeyType: 'RANGE'}] ];
const tableAttributes: AttributeDefinitions[] = [ [{ AttributeName: 'cartId', AttributeType: 'S' }, { AttributeName: 'sku', AttributeType: 'S' }] ];

describe('DynamoDB Interface', () => {

    let mockedDynamo: DynamoDBMock;

    before(function(done) {

        this.timeout(10000);
        const dynamoconfig: LocalDynamoConfiguration = {
            tableNames: tableNames,
            tableKeys: tableKeys,
            tableAttributes: tableAttributes,
        };

        mockedDynamo = new DynamoDBMock(dynamoconfig);

         /* tslint:disable no-unsafe-any */
        mockedDynamo.start()
        .then((result) => { done(); })
        .catch((error) => {throw new Error(error); });

    });

    /* tslint:disable arrow-return-shorthand */
    it('Tables must be created', async () => {

        return mockedDynamo.listDynamoTables().then((result) => {
            expect(result.length).to.above(0);
        });

    }).timeout(5000);

    /* tslint:disable arrow-return-shorthand */
    it('DynamoDB Interface must PutItem with Success', async () => {

        const sut = new DynamoDBTable(tableNames[0], mockedDynamo.rawDynamo);
        const mockedObject = { cartId: '12345', sku: '6789', name: 'Product Example', price: 10.55, quantity: 15 };
        return sut.putItem({ cartId: '12345', sku: '6789' }, mockedObject).then((result) => {
            expect(result).to.equals(true);
        });

    }).timeout(5000);

    /* tslint:disable arrow-return-shorthand */
    it('DynamoDB Interface must GetItem After being Inserted with Success', async () => {

        const sut = new DynamoDBTable(tableNames[0], mockedDynamo.rawDynamo);
        const mockedKeys = { cartId: '12345', sku: '6789' };
        const mockedObject = { cartId: '12345', sku: '6789', name: 'Product Example', price: 10.55, quantity: 15 };

        return sut.putItem(mockedKeys, mockedObject)
        .then(async (result) => sut.getItem(mockedKeys))
        .then((object) => expect(object).to.eqls(mockedObject));

    }).timeout(5000);

    /* tslint:disable arrow-return-shorthand */
    it('DynamoDB Interface must QueryItem After being Inserted with Success', async () => {

        const sut = new DynamoDBTable(tableNames[0], mockedDynamo.rawDynamo);
        const mockedCartId = '98765';
        const mockedKeys1 = { cartId: mockedCartId, sku: '6789' };
        const mockedKeys2 = { cartId: mockedCartId, sku: '0123' };
        const mockedObject1 = { cartId: mockedCartId, sku: '6789', name: 'Product Example', price: 10.55, quantity: 15 };
        const mockedObject2 = { cartId: mockedCartId, sku: '0123', name: 'Product Example', price: 10.55, quantity: 15 };

        return sut.putItem(mockedKeys1, mockedObject1)
        .then(async (result) => sut.putItem(mockedKeys2, mockedObject2))
        .then(async (result) => sut.queryItemByHashKey({ cartId: mockedCartId }))
        .then((object) => expect(object.length).to.eqls(2));

    }).timeout(5000);

    /* tslint:disable arrow-return-shorthand */
    it('DynamoDB Interface must DeleteItem After being Inserted with Success', async () => {

        const sut = new DynamoDBTable(tableNames[0], mockedDynamo.rawDynamo);
        const mockedCartId = '12349';
        const mockedKeys = { cartId: mockedCartId, sku: '6789' };
        const mockedObject = { cartId: mockedCartId, sku: '6789', name: 'Product Example', price: 10.55, quantity: 15 };

        return sut.putItem(mockedKeys, mockedObject)
        .then(async (result) => sut.queryItemByHashKey({ cartId: mockedCartId }))
        .then((objects) => { objects.length > 0 ? Promise.resolve(true) : Promise.reject('No Data Inserted In Table'); })
        .then(async (result) => sut.deleteItems(mockedKeys))
        .then(async (result) => sut.queryItemByHashKey({ cartId: mockedCartId }))
        .then((objects) => expect(objects.length).to.eqls(0));

    }).timeout(5000);

    after(() => {
        mockedDynamo.stop();
    });

});
