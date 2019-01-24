/* tslint:disable: no-implicit-dependencies */
import { AWSError } from 'aws-sdk';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ServiceError } from '../common/types';
import { InputParser } from '../common/backend';

/* tslint:disable: no-unnecessary-class */
export class AWSParser {

    public static parseAWSError(error: AWSError, resource: { type: string; name: string }): ServiceError {

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

        return {logTag: 'ERROR::', code: errorCode, httpStatusCode: httpCode, resource: resourceDescription, payload: error};

    }

    public static parseAPIGatewayEvent(event: APIGatewayProxyEvent): APIGatewayEventParser {

        return new APIGatewayEventParser(event);

    }

}

export class APIGatewayEventParser implements InputParser {

    private readonly AuthorizationheaderName = 'Authorization';

    constructor(private readonly event: APIGatewayProxyEvent) { }

    public getHttpMethod(): string { return this.event.httpMethod; }

    public getUserId(): string {

        if (this.event.headers == undefined) { return null; }

        const value = this.event.headers[this.AuthorizationheaderName];
        return value;

    }

    public getPathParam(name: string): string {

        if (this.event.pathParameters == undefined) { return null; }

        const value = this.event.pathParameters[name];
        return value;

    }

    public getQueryParam(name: string): string {

        if (this.event.queryStringParameters == undefined) { return null; }

        const value = this.event.queryStringParameters[name];
        return value;

    }

    public getResource(): string {

        const value = this.event.resource;
        return value;

    }

    public getPayload(): Object {

        const value = this.event.body;
        const parsed = JSON.parse(value);

        /* tslint:disable: no-unsafe-any */
        return parsed;

    }

}
