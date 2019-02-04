/* tslint:disable all */
import { handler, setInjector } from '../src/index'
import 'mocha';
import { expect, should } from 'chai';
import lambdaTester = require('lambda-tester');

import { MockedEvents, AWSEvent } from './mockedEvents/MockedEvents';
import { KeySchema, AttributeDefinitions } from 'aws-sdk/clients/dynamodb';
import { DynamoDBMock, LocalDynamoConfiguration } from './mockedDependencies/dynamoMock';
import { DependencyInjectorMock } from './mockedDependencies/injectorMock';

let mockedEvents:MockedEvents;
let mockedInjector: DependencyInjectorMock;
let mockedDynamo: DynamoDBMock;

describe('Lambda Handler', () => {

    before(function(done) {

        mockedEvents = new MockedEvents();

        const tableNames = ['ShopingCart'];
        const tableKeys: KeySchema[] = [ [{ AttributeName: 'cartId', KeyType: 'HASH'}, { AttributeName: 'sku', KeyType: 'RANGE'}] ];
        const tableAttributes: AttributeDefinitions[] = [ [{ AttributeName: 'cartId', AttributeType: 'S' }, { AttributeName: 'sku', AttributeType: 'S' }] ];

        this.timeout(10000);
        const dynamoconfig: LocalDynamoConfiguration = {
            tableNames: tableNames,
            tableKeys: tableKeys,
            tableAttributes: tableAttributes,
        };

        const context = mockedEvents.getContext();
        mockedDynamo = new DynamoDBMock(dynamoconfig);
        mockedDynamo.start()
        .then((result) => {
            mockedInjector = new DependencyInjectorMock(context, mockedDynamo.rawDynamo, tableNames[0]);
            done();
        })
        .catch((error) => {throw new Error(error); });

    });

    // CART GET
    it('Cart::Get OK response when send an Authenticated Get Request', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartGetAuthorized);
        const objectId = mocked.headers['Authorization']
        const object = { cartId: objectId, sku: '12345', name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });


    });

    it('Cart::Get OK response when send an Unauthenticated Get Request with SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartGetUnauthorizedWithSessionId);
        const objectId = mocked.queryStringParameters['sessionId']
        const object = { cartId: objectId, sku: '12345', name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Cart::Get Unauthorized response when send an Unauthenticated Get Request without SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartGetUnauthorized);

        const response = await lambdaTester(handler).event(mocked);
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(401) });

    });


    // CART CLEARANCE
    it('Cart::Get OK response when send an Authenticated Delete Request', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartDeleteAuthorized);
        const objectId = mocked.headers['Authorization']
        const object = { cartId: objectId, sku: '12345', name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Cart::Get OK response when send an Unauthenticated Delete Request with SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartDeleteUnauthorizedWithSessionId);
        const objectId = mocked.queryStringParameters['sessionId']
        const object = { cartId: objectId, sku: '12345', name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Cart::Get Unauthorized response when send an Unauthenticated Delete Request without SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartDeleteUnauthorized);

        const response = await lambdaTester(handler).event(mocked);
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(401) });

    });

    // PRODUCT GET
    it('Product::Get OK response when send an Authenticated Get Request', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductGetAuthorized);
        const objectId = mocked.headers['Authorization']
        const rangeKey = mocked.pathParameters['productSku']
        const object = { cartId: objectId, sku: rangeKey, name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Product::Get OK response when send an Unauthenticated Get Request with SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductGetUnauthorizedWithSessionId);
        const objectId = mocked.queryStringParameters['sessionId']
        const rangeKey = mocked.pathParameters['productSku']
        const object = { cartId: objectId, sku: rangeKey, name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Product::Get Unauthorized response when send an Unauthenticated Get Request without SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductGetUnauthorized);

        const response = await lambdaTester(handler).event(mocked);
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(401) });

    });

    // PRODUCT POST
    it('Product::Get Created response when send an Authenticated Post Request', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPostAuthorized);

        const response = await lambdaTester(handler).event(mocked)
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(201) });

    });

    it('Product::Get Created response when send an Unauthenticated Post Request with SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPostUnauthorizedWithSessionId);

        const response = await lambdaTester(handler).event(mocked)
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(201) });

    });

    it('Product::Get Bad Request response when send an Authenticated Post Request with Invalid Object', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPostAuthorizedwithInvalidBody);

        const response = await lambdaTester(handler).event(mocked)
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(400) });

    });

    it('Product::Get Unauthorized response when send an Unauthenticated Post Request without SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPostUnauthorized);

        const response = await lambdaTester(handler).event(mocked)
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(401) });

    });

    // PRODUCT PUT
    it('Product::Get OK response when send an Authenticated Put Request', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPutAuthorized);
        const objectId = mocked.headers['Authorization']
        const rangeKey = mocked.pathParameters['productSku']
        const object = { cartId: objectId, sku: rangeKey, name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Product::Get OK response when send an Unauthenticated Put Request with SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPutUnauthorizedWithSessionId);
        const objectId = mocked.queryStringParameters['sessionId']
        const rangeKey = mocked.pathParameters['productSku']
        const object = { cartId: objectId, sku: rangeKey, quantity: 10};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Product::Get Bad Request response when send a Put Request with Invalid Object', async () => {

        setInjector(mockedInjector);
        const persisted = mockedEvents.getEvent(AWSEvent.ProductPutAuthorized);
        const objectId = persisted.headers['Authorization']
        const rangeKey = persisted.pathParameters['productSku']
        const object = { cartId: objectId, sku: rangeKey, name: 'Example', quantity: 10, price: 15.5};

        const mocked = mockedEvents.getEvent(AWSEvent.ProductPutAuthorizedwithInvalidBody);

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(400) });

    });

    it('Product::Get Unauthorized response when send an Unauthenticated Put Request without SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPutUnauthorized);

        const response = await lambdaTester(handler).event(mocked)
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(401) });

    });

    // PRODUCT DELETE
    it('Product::Get Ok response when send an Authenticated Delete Request', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductDeleteAuthorized);
        const objectId = mocked.headers['Authorization']
        const rangeKey = mocked.pathParameters['productSku']
        const object = { cartId: objectId, sku: rangeKey, name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Product::Get OK response when send an Unauthenticated Delete Request with SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductDeleteUnauthorizedWithSessionId);
        const objectId = mocked.queryStringParameters['sessionId']
        const rangeKey = mocked.pathParameters['productSku']
        const object = { cartId: objectId, sku: rangeKey, name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('Product::Get Unauthorized response when send an Unauthenticated Delete Request without SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.ProductDeleteUnauthorized);

        const response = await lambdaTester(handler).event(mocked)
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(401) });

    });

    // CART CONVERSION
    it('CartConversion::Get Ok response when send an Authenticated Post Request', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartConvertAuthorized);
        const objectId = mocked.queryStringParameters['sessionId']
        const object = { cartId: objectId, sku: 'NewSkuValue', name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(200) });

    });

    it('CartConversion::Get Bad Request when send an Authenticated Post Request without SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartConvertAuthorizedWithoutSessionId);

        const response = await lambdaTester(handler).event(mocked)
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(400) });

    });

    it('CartConversion::Get NotFound response when send an Inexistent SessionId', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartConvertAuthorizedInexistentQueryParamOnDB);
        const objectId = 'willnotExisitOnDb'
        const object = { cartId: objectId, sku: 'NewSkuValue', name: 'Example', quantity: 10, price: 15.5};

        const response = await mockedInjector.injectItemOnTable({ cartId: object.cartId, sku: object.sku}, object)
        .then((result) => { return lambdaTester(handler).event(mocked)});

        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(404) });

    });

    it('CartConversion::Get Unauthorized response when send an Unauthenticated Post Request', async () => {

        setInjector(mockedInjector);
        const mocked = mockedEvents.getEvent(AWSEvent.CartConvertUnauthorized);

        const response = await lambdaTester(handler).event(mocked)
        return response.expectResult((verifier) => { expect(verifier.statusCode).to.eql(401) });

    });

    after(() => {
        mockedDynamo.stop();
    });

});
