import { Context, ClientContext, APIGatewayProxyEvent } from 'aws-lambda';
import {CognitoIdentity } from 'aws-sdk';
 
import fs = require('fs');

export enum AWSEvent {
    CartConvertAuthorized = 'APIGatewayEvent_CartConvertAuthorized',
    CartConvertAuthorizedWithoutSessionId = 'APIGatewayEvent_CartConvertAuthorizedWithoutSessionId',
    CartConvertUnauthorized = 'APIGatewayEvent_CartConvertUnauthorized',
    CartDeleteAuthorized = 'APIGatewayEvent_CartDeleteAuthorized',
    CartDeleteUnauthorized = 'APIGatewayEvent_CartDeleteUnauthorized',
    CartDeleteUnauthorizedWithSessionId = 'APIGatewayEvent_CartDeleteUnauthorizedWithSessionId',
    CartGetAuthorized = 'APIGatewayEvent_CartGetAuthorized',
    CartGetUnauthorized = 'APIGatewayEvent_CartGetUnauthorized',
    CartGetUnauthorizedWithSessionId = 'APIGatewayEvent_CartGetUnauthorizedWithSessionId',
    ProductGetAuthorized = 'APIGatewayEvent_ProductGetAuthorized',
    ProductGetUnauthorized = 'APIGatewayEvent_ProductGetUnauthorized',
    ProductGetUnauthorizedWithSessionId = 'APIGatewayEvent_ProductGetUnauthorizedWithSessionId',
    ProductPostAuthorized = 'APIGatewayEvent_ProductPostAuthorized',
    ProductPostAuthorizedwithInvalidBody = 'APIGatewayEvent_ProductPostAuthorizedwithInvalidBody',
    ProductPostUnauthorized = 'APIGatewayEvent_ProductPostUnauthorized',
    ProductPostUnauthorizedWithSessionId = 'APIGatewayEvent_ProductPostUnauthorizedWithSessionId',
    ProductPutAuthorized = 'APIGatewayEvent_ProductPutAuthorized',
    ProductPutAuthorizedwithInvalidBody = 'APIGatewayEvent_ProductPutAuthorizedwithInvalidBody',
    ProductPutUnauthorized = 'APIGatewayEvent_ProductPutUnauthorized',
    ProductPutUnauthorizedWithSessionId = 'APIGatewayEvent_ProductPutUnauthorizedWithSessionId',
    ProductDeleteAuthorized = 'APIGatewayEvent_ProductDeleteAuthorized',
    ProductDeleteUnauthorized = 'APIGatewayEvent_ProductDeleteUnauthorized',
    ProductDeleteUnauthorizedWithSessionId = 'APIGatewayEvent_ProductDeleteUnauthorizedWithSessionId',

}

export class MockedEvents {

    constructor() { }

    getEvent(event: AWSEvent): APIGatewayProxyEvent {

        let filename = "./tests/mockedEvents/" + event + '.json'
        let contents = fs.readFileSync(filename,'utf8');
        return JSON.parse(contents)
        
    }

    getContext(): Context { return new MockedContext() }



}

class MockedContext {

    callbackWaitsForEmptyEventLoop: boolean = false
    functionName: string = "mockedFunction"
    functionVersion: string = "0.1"
    invokedFunctionArn: string = "local:mockedfunction"
    memoryLimitInMB: number = 128
    awsRequestId: string = "mockedRequest"
    logGroupName: string = "mockedLogGroup"
    logStreamName: string = "mockedLogStream"
    identity = null
    clientContext = null

    // Functions
    getRemainingTimeInMillis(): number { return 1000000 }
    done(error?: Error, result?: any): void { }
    fail(error: Error | string): void { }
    succeed(messageOrObject: any): void { }

}

