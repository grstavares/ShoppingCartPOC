/* tslint:disable all */
import { MockedEvents, AWSEvent } from './mockedEvents/MockedEvents';
import { expect, should } from 'chai';
import 'mocha';
import { OperationBuilder, AllowedOperation } from '../src/operations';

describe('OperationBuilder', () => {

    it('CartId should be equal Authorization header in Authenticated Responses', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.CartGetAuthorized);
        let context = mockedEvents.getContext()
        let authHeader = mocked.headers['Authorization']

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getCartId()).to.equal(authHeader);

    });

    it('CartId should be equal Query Param in Unauthenticated Responses', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.CartGetUnauthorizedWithSessionId);
        let context = mockedEvents.getContext()
        let queryParam = mocked.queryStringParameters['sessionId']

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getCartId()).to.equal(queryParam);

    });

    it('CartId should be null when Unauthenticated without SessionId', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.CartGetUnauthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getCartId()).to.null;

    });

    it('Valid Payload Body must be recognized as a Valid Object', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.ProductPutAuthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        let body = JSON.parse(mocked.body)
        expect(sut.isValidEventBody(body)).to.true;

    });

    it('Invalid Payload Body must be recognized as an Invalid Object', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.ProductPutAuthorizedwithInvalidBody);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        let body = JSON.parse(mocked.body)
        expect(sut.isValidEventBody(body)).to.false;

    });

    it('Must Return GetAllProducts Operation for GetAll Request', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.CartGetAuthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getOperation()).to.equals(AllowedOperation.GetAllProducts);

    });

    it('Must Return RemoveAllProducts Operation for RemoveAll Request', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.CartDeleteAuthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getOperation()).to.equals(AllowedOperation.RemoveAllProducts);

    });

    it('Must Return GetProduct Operation for Get Request', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.ProductGetAuthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getOperation()).to.equals(AllowedOperation.GetProduct);

    });

    it('Must Return AddProduct Operation for Post Request', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.ProductPostAuthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getOperation()).to.equals(AllowedOperation.AddProduct);

    });

    it('Must Return UpdateProduct Operation for Put Request', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.ProductPutAuthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getOperation()).to.equals(AllowedOperation.UpdateProduct);

    });

    it('Must Return RemoveProduct Operation for Delete Request', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.ProductDeleteAuthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getOperation()).to.equals(AllowedOperation.RemoveProduct);

    });

    it('Must Return ConvertCart Operation for ConvertCart Request', () => {

        let mockedEvents = new MockedEvents();
        let mocked = mockedEvents.getEvent(AWSEvent.CartConvertAuthorized);
        let context = mockedEvents.getContext()

        let sut = new OperationBuilder(mocked, context)
        expect(sut.getOperation()).to.equals(AllowedOperation.ConvertCart);

    });

});