/* tslint:disable: no-implicit-dependencies */
import { APIGatewayProxyEvent } from 'aws-lambda';

export class APIGatewayEventParser {

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
        // console.log(`:::: GetPathParam (${name}) -> ${value}`)
        return value;

    }

    public getQueryParam(name: string): string {

        if (this.event.queryStringParameters == undefined) { return null; }

        const value = this.event.queryStringParameters[name];
        // console.log(`:::: GetQueryParam (${name}) -> ${value}`)
        return value;

    }

    public getResource(): string {

        const value = this.event.resource;
        // console.log(`:::: GetResourceType -> ${value}`)
        return value;

    }

    public getPayload(): Object {

        const value = this.event.body;
        const parsed = JSON.parse(value);

        /* tslint:disable: no-unsafe-any */
        return parsed;

    }

}
