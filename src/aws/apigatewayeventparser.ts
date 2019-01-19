import { Context, APIGatewayProxyEvent } from 'aws-lambda';

export class APIGatewayEventParser {

    constructor(private event: APIGatewayProxyEvent) { }

    getHttpMethod(): string { return this.event.httpMethod }
    
    getUserId(): string {

        if (this.event.headers == undefined) { return null }

        let value = this.event.headers['Authorization']
        // console.log(`:::: GetUserId -> ${value}`)
        return value

    }
    
    getPathParam(name: string): string {

        if (this.event.pathParameters == undefined) { return null }

        let value = this.event.pathParameters[name]
        // console.log(`:::: GetPathParam (${name}) -> ${value}`)
        return value

    }

    getQueryParam(name: string): string {
        
        if (this.event.queryStringParameters == undefined) { return null }

        let value = this.event.queryStringParameters[name]
        // console.log(`:::: GetQueryParam (${name}) -> ${value}`)
        return value

    }

    getResource(): string {
        
        let value = this.event.resource
        // console.log(`:::: GetResourceType -> ${value}`)
        return value

    }

    getPayload(): Object {

        let value = this.event.body
        let parsed = JSON.parse(value)
        return parsed

    }

}