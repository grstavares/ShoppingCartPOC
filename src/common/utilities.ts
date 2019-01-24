import { ServiceResponse, InfrastructureMetric, InfrastructureMetricDimension, ServiceError } from './types';

export const HttpStatusCode = {
    badRequest: 400,
    created: 201,
    forbidden: 403,
    internalServerError: 500,
    notFound: 404,
    ok: 200,
    unauthorized: 401,
};

/* tslint:disable no-unnecessary-class */
export class ResponseBuilder {

    private static readonly defaultHeaders = {'Content-Type': 'application/json'};

    public static ok<T>(result: T): ServiceResponse { return ResponseBuilder.parseResponse(result, HttpStatusCode.ok); }

    public static created<T>(url: string, result: T): ServiceResponse {
        const headers = { Location: url };
        return ResponseBuilder.parseResponse(result, HttpStatusCode.created, headers);
    }

    public static badRequest(reason: string, traceId: string): ServiceResponse {

        const error = ResponseBuilder.parseError(HttpStatusCode.badRequest, reason, traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.badRequest);

    }

    public static unauthorized(reason: string, traceId: string): ServiceResponse {

        const error = ResponseBuilder.parseError(HttpStatusCode.unauthorized, 'REDACTED', traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.unauthorized);

    }

    public static forbidden(reason: string, traceId: string): ServiceResponse {

        const error = ResponseBuilder.parseError(HttpStatusCode.forbidden, 'REDACTED', traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.forbidden);

    }

    public static notFound(reason: string, traceId: string): ServiceResponse {

        const error = ResponseBuilder.parseError(HttpStatusCode.notFound, reason, traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.notFound);

    }

    public static internalError(reason: string, traceId: string): ServiceResponse {

        const error = ResponseBuilder.parseError(HttpStatusCode.internalServerError, 'REDACTED', traceId);
        return ResponseBuilder.parseResponse(error, HttpStatusCode.internalServerError);

    }

    private static parseError(statusCode: number, message: string, traceId: string): Object {

        const messageBody = message + ((traceId === null || traceId == undefined) ? `:TraceId -> ${traceId}` : '');
        return { error : { message: messageBody, statusCode: statusCode }};

    }

    private static parseResponse<T>(result: T, statusCode: number, headers?: {[key: string]: string}): ServiceResponse {

        const responseBody = (result !== null && result !== undefined) ? JSON.stringify(result) : null;

        /* tslint:disable: prefer-object-spread */
        const parsedHeaders = (headers !== null && headers != undefined) ? Object.assign(headers, ResponseBuilder.defaultHeaders) : ResponseBuilder.defaultHeaders;

        const response: ServiceResponse = {
            body: responseBody,
            headers: parsedHeaders,
            statusCode: statusCode,
        };

        return response;

    }

}

export class MetricBuilder {

    private readonly timestamp: Date;
    private readonly name: string;
    private readonly value: number;
    private readonly dimensions: InfrastructureMetricDimension[] = [];

    constructor(name: string, value: number) {
        this.timestamp = new Date();
        this.name = name;
        this.value = value;
    }

    public withResource(resourceName: string): MetricBuilder { this.dimensions.push({ Name: 'Resource', Value: resourceName }); return this; }
    public withResourceType(resourceName: string): MetricBuilder { this.dimensions.push({ Name: 'ResourceType', Value: resourceName }); return this; }
    public withDimension(dimensionName: string, dimensionValue: string): MetricBuilder { this.dimensions.push({ Name: dimensionName, Value: dimensionValue }); return this; }

    public build(): InfrastructureMetric {

        const metric: InfrastructureMetric = {
            dimensions: this.dimensions,
            name: this.name,
            timestamp: this.timestamp,
            value: this.value,
        };

        return metric;

    }
}

/* tslint:disable no-unnecessary-class */
export class ErrorBuilder {

    public static newError(errorCode: string, resource: string, payload: Object): ServiceError {

        const error: ServiceError = { logTag: 'ERROR::', code: errorCode, httpStatusCode: 500,  resource: resource, payload: payload };
        return error;

    }

}

/* tslint:disable all */
export class UUID {

    public static newUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

}
