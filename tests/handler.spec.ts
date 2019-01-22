/* tslint:disable all */
import { handler } from '../src/index'
import 'mocha';
import { expect, should } from 'chai';
import lambdaTester = require('lambda-tester');

import { MockedEvents, AWSEvent } from './mockedEvents/MockedEvents';

describe('Lambda Handler', () => {

    // CART GET
    it('Cart::Get OK response when send an Authenticated Post Request', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartGetAuthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Cart::Get OK response when send an Unauthenticated Get Request with SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartGetUnauthorizedWithSessionId);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Cart::Get Unauthorized response when send an Unauthenticated Get Request without SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartGetUnauthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(401).to.eql(result.statusCode);
        });

    });


    // CART CLEARANCE
    it('Cart::Get OK response when send an Authenticated Delete Request', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartDeleteAuthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Cart::Get OK response when send an Unauthenticated Delete Request with SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartDeleteUnauthorizedWithSessionId);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Cart::Get Unauthorized response when send an Unauthenticated Delete Request without SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartDeleteUnauthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(401).to.eql(result.statusCode);
        });

    });

    // PRODUCT GET
    it('Product::Get OK response when send an Authenticated Get Request', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductGetAuthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Product::Get OK response when send an Unauthenticated Get Request with SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductGetUnauthorizedWithSessionId);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Product::Get Unauthorized response when send an Unauthenticated Get Request without SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductGetUnauthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(401).to.eql(result.statusCode);
        });

    });

    // PRODUCT POST
    it('Product::Get Created response when send an Authenticated Post Request', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPostAuthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(201).to.eql(result.statusCode);
        });

    });

    it('Product::Get OK response when send an Unauthenticated Post Request with SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPostUnauthorizedWithSessionId);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Product::Get Bad Request response when send an Authenticated Post Request with Invalid Object', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPostAuthorizedwithInvalidBody);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(403).to.eql(result.statusCode);
        });

    });

    it('Product::Get Unauthorized response when send an Unauthenticated Post Request without SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPostUnauthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(401).to.eql(result.statusCode);
        });

    });

    // PRODUCT PUT
    it('Product::Get OK response when send an Authenticated Put Request', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPutAuthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Product::Get OK response when send an Unauthenticated Put Request with SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPutUnauthorizedWithSessionId);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Product::Get Bad Request response when send a Put Request with Invalid Object', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPutAuthorizedwithInvalidBody);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(403).to.eql(result.statusCode);
        });

    });

    it('Product::Get Unauthorized response when send an Unauthenticated Put Request without SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductPutUnauthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(401).to.eql(result.statusCode);
        });

    });

    // PRODUCT DELETE
    it('Product::Get Ok response when send an Authenticated Delete Request', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductDeleteAuthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Product::Get OK response when send an Unauthenticated Delete Request with SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductDeleteUnauthorizedWithSessionId);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('Product::Get Unauthorized response when send an Unauthenticated Delete Request without SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.ProductDeleteUnauthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(401).to.eql(result.statusCode);
        });

    });

    // CART CONVERSION
    it('CartConversion::Get Ok response when send an Authenticated Post Request', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartConvertAuthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('CartConversion::Get Bad Request when send an Authenticated Post Request without SessionId', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartConvertAuthorizedWithoutSessionId);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(200).to.eql(result.statusCode);
        });

    });

    it('CartConversion::Get Unauthorized response when send an Unauthenticated Post Request', async () => {

        const mockedEvents = new MockedEvents();
        const mocked = mockedEvents.getEvent(AWSEvent.CartConvertUnauthorized);

        return lambdaTester(handler).event(mocked).expectResult((result) => {
            expect(401).to.eql(result.statusCode);
        });

    });


});