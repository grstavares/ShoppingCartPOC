import { ServiceError, InfrastructureMetric, InfrastructureMetricDimension, APIGatewayResponse } from './types';

export const HttpStatusCode = {
    ok: 200,
    created: 201,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    internalServerError: 500,
};

export class UUID {

    static newUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

}

export class ResponseBuilder {

    private static defaultHeaders = {'Content-Type': 'application/json'};

    public static ok<T>(result: T): APIGatewayResponse { return ResponseBuilder.parseResponse(result, HttpStatusCode.ok); }
    
    public static created<T>(url: string, result: T): APIGatewayResponse {
        const headers = { Location: url }
        return ResponseBuilder.parseResponse(result, HttpStatusCode.created, headers);
    }

    public static badRequest(reason: string, traceId: string): APIGatewayResponse {
        
        const error = ResponseBuilder.parseError(HttpStatusCode.badRequest, reason, traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.badRequest);
        
    }

    public static unauthorized(reason: string, traceId: string): APIGatewayResponse {
        
        const error = ResponseBuilder.parseError(HttpStatusCode.unauthorized, 'REDACTED', traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.unauthorized);
        
    }

    public static forbidden(reason: string, traceId: string): APIGatewayResponse {
        
        const error = ResponseBuilder.parseError(HttpStatusCode.forbidden, 'REDACTED', traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.forbidden);
        
    }
    
    public static notFound(reason: string, traceId: string): APIGatewayResponse {

        const error = ResponseBuilder.parseError(HttpStatusCode.notFound, reason, traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.notFound);

    }

    public static internalError(reason: string, traceId: string): APIGatewayResponse {

        const error = ResponseBuilder.parseError(HttpStatusCode.internalServerError, 'REDACTED', traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.internalServerError);

    }
    
    private static parseError(statusCode: number, message: string, traceId: string): Object {

        const messageBody = message + (traceId ? ':TraceId -> ${traceId}' : '' );
        return { error : { statusCode: statusCode, message: messageBody } }

    }

    private static parseResponse<T>(result: T, statusCode: number, headers?: {[key: string]: string}):APIGatewayResponse {

        const responseBody = result ? JSON.stringify(result) : null;
        const parsedHeaders = headers ? Object.assign(headers, ResponseBuilder.defaultHeaders ) : ResponseBuilder.defaultHeaders;
        const response: APIGatewayResponse = {
            statusCode: statusCode,
            headers: parsedHeaders,
            body: responseBody
        }

        return response;

    }

}

export class MetricBuilder {

    timestamp: Date;
    name: string;
    value: number;
    dimensions: InfrastructureMetricDimension[] = [];

    constructor(name: string, value: number) { 
        this.timestamp = new Date();
        this.name = name;
        this.value = value;
    }

    withResource(resourceName: string): MetricBuilder { this.dimensions.push({ Name: 'Resource', Value: resourceName }); return this }
    withResourceType(resourceName: string): MetricBuilder { this.dimensions.push({ Name: 'ResourceType', Value: resourceName }); return this }
    withDimension(dimensionName: string, dimensionValue: string): MetricBuilder { this.dimensions.push({ Name: dimensionName, Value: dimensionValue }); return this }

    build(): InfrastructureMetric {

        const metric: InfrastructureMetric = {
            timestamp: this.timestamp,
            name: this.name,
            value: this.value,
            dimensions: this.dimensions
        }

        return metric;

    }
}

export class ErrorBuilder {

    public static newError(errorCode: string, resource: string, payload: Object): ServiceError {

        const error: ServiceError = { code: errorCode, httpStatusCode: 500,  resource: resource, payload: payload }
        return error;

    }

}