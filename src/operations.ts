/* tslint:disable no-implicit-dependencies */
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { APIGatewayEventParser } from './aws/apigatewayeventparser';
import { ResponseBuilder, NoSQLTable } from './common';
import { APIGatewayResponse } from './common/types';
import { DependencyInjector } from './dependencyInjector';
import { CartProduct } from './objectSchemas';
import { MetricBuilder, ErrorBuilder } from './common/utilities';

export enum AllowedOperation {
    GetAllProducts = 'GetAllProducts',
    RemoveAllProducts = 'RemoveAllProducts',
    GetProduct = 'GetProduct',
    AddProduct = 'AddProduct',
    UpdateProduct = 'UpdateProduct',
    RemoveProduct = 'RemoveProduct',
    ConvertCart = 'ConvertCart',
}

export enum OperationError {
    ResourceNotFound = 'ResourceNotFound',
    DependencyError = 'DependencyError',
}

export class OperationBuilder {

    private readonly tableResourceId = 'NoSQLTable';
    private readonly topicResourceId = 'MessageTopic';
    private readonly skuPropertyKey = 'sku';
    private readonly traceId: string;
    private readonly eventParser: APIGatewayEventParser;

    constructor(private readonly event: APIGatewayProxyEvent, private readonly context: Context) {

        this.traceId = context.awsRequestId;
        this.eventParser = new APIGatewayEventParser(event);

    }

    public getOperation(): AllowedOperation {

        const resource = this.event.resource;
        const method = this.event.httpMethod;

        if (resource.toLowerCase() === '/cart') {

            if (method.toLowerCase() === 'get') { return AllowedOperation.GetAllProducts;
            } else if (method.toLowerCase() === 'post') { return AllowedOperation.AddProduct;
            } else if (method.toLowerCase() === 'delete') { return AllowedOperation.RemoveAllProducts;
            } else {return null; }

        } else if (resource.toLowerCase() === '/cart/{productsku}') {

            if (method.toLowerCase() === 'get') { return AllowedOperation.GetProduct;
            } else if (method.toLowerCase() === 'put') { return AllowedOperation.UpdateProduct;
            } else if (method.toLowerCase() === 'delete') { return AllowedOperation.RemoveProduct;
            } else {return null; }

        } else if (resource.toLowerCase() === '/conversion') {

            if (method.toLowerCase() === 'post') { return AllowedOperation.ConvertCart;
            } else {return null; }

        } else { return null; }

    }

    public getCartId(): string {

        const userId = this.eventParser.getUserId();
        if (userId !== null && userId !== undefined) { return userId; }

        const sessionId = this.eventParser.getQueryParam('sessionId');
        if (this.isValidSessionId(sessionId)) { return sessionId; }

        return null;

    }

    /* tslint:disable no-unsafe-any */
    public isValidEventBody(object: any): object is CartProduct {

        if (object.sku == undefined) { return false; }
        if (object.name == undefined) { return false; }
        if (object.price == undefined) { return false; }
        if (object.quantity == undefined) { return false; }
        return true;

    }

    public isValidSessionId(session: string) {

        if (session === null || session == undefined) { return false; }

        // Check SessionId Format
        return true;

    }

    public async executeOperation(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const operation = this.getOperation();
        switch (operation) {
            case 'GetAllProducts': { return this.performGetAllProducts(resolver); }
            case 'RemoveAllProducts': { return this.performRemoveAllProducts(resolver); }
            case 'GetProduct': { return this.performGetProduct(resolver); }
            case 'AddProduct': { return this.performAddProduct(resolver); }
            case 'UpdateProduct': { return this.performUpdateProduct(resolver); }
            case 'RemoveProduct': { return this.performRemoveProduct(resolver); }
            case 'ConvertCart': { return this.performConvertCart(resolver); }
            default: {

                const response = ResponseBuilder.badRequest('Invalid Request Method', this.traceId);
                return Promise.reject(response);

            }
        }

    }

    private async performGetAllProducts(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId();

        if (cartId === null) {
            const response = ResponseBuilder.unauthorized('', this.traceId);
            return Promise.reject(response);
        }

        const keys = { cartId: cartId };
        return new Promise((resolve, reject) => {

            resolver.getNoSQLTable()
            .then(async (dynamo) => dynamo.queryItemByHashKey(keys))
            .then((values) => {

                if (values.length > 0) {

                    const response = ResponseBuilder.ok(values);
                    resolve(response);

                } else { reject(ResponseBuilder.notFound(JSON.stringify(keys), this.traceId)); }

            }).catch((reason) => {
                this.publishOperationError(OperationError.DependencyError, reason, this.tableResourceId, resolver);
                return ResponseBuilder.internalError('REDACTED', this.traceId);
            });

        });

    }

    private async performRemoveAllProducts(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId();

        if (cartId === null) {return ResponseBuilder.unauthorized('', this.traceId); }

        const keys = { cartId: cartId };

        return resolver.getNoSQLTable()
        .then(async (dynamo) => {

            const values = dynamo.queryItemByHashKey(keys);
            const response: [NoSQLTable, Promise<Object[]>] = [dynamo, values];
            return response;

        })
        .then(async (tuple) => {

            const dynamo = tuple[0];
            const values = await tuple[1];

            if (values.length === 0) { return ResponseBuilder.notFound('', this.traceId); }

            const promises: Array<Promise<boolean>> = [];
            values.forEach((element) => {
                const elementSku = element[this.skuPropertyKey];
                promises.push(dynamo.deleteItems({cartId: cartId, sku: elementSku }));
            });

            const responses = await Promise.all(promises);
            const falses = responses.filter((element, index, array) => !element);
            if (falses.length === 0) {

                this.publishMessage({ action: AllowedOperation.RemoveAllProducts, payload: { cartId: cartId } }, resolver)
                .catch((error) => this.publishOperationError(OperationError.DependencyError, error, this.topicResourceId, resolver));
                return ResponseBuilder.ok({});

            } else {
                this.publishOperationError(OperationError.DependencyError, {message: 'UnableToRemoveItems'}, this.tableResourceId, resolver);
                return ResponseBuilder.internalError('REDACTED', this.traceId);
            }

        })
        .catch((reason) => {
            this.publishOperationError(OperationError.DependencyError, reason, this.tableResourceId, resolver);
            return ResponseBuilder.internalError('REDACTED', this.traceId);
        });

    }

    private async performGetProduct(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId();
        const productSku = this.eventParser.getPathParam('productSku');

        if (cartId === null) {
            const response = ResponseBuilder.unauthorized('', this.traceId);
            return Promise.reject(response);
        }

        if (productSku === null) {
            const response = ResponseBuilder.badRequest('', this.traceId);
            return Promise.reject(response);
        }

        // const dynamo = resolver.getNoSQLTable();

        const keys = { cartId: cartId, sku: productSku };
        return new Promise((resolve, reject) => {

            resolver.getNoSQLTable()
            .then(async (dynamo) => dynamo.getItem(keys))
            .then((value) => {

                if (value !== null && value !== undefined) {

                    const response = ResponseBuilder.ok(value);
                    resolve(response);

                } else {

                    const response = ResponseBuilder.notFound(JSON.stringify(keys), this.traceId);
                    reject(response);

                }

            }).catch((reason) => {
                this.publishOperationError(OperationError.DependencyError, reason, this.tableResourceId, resolver);
                return ResponseBuilder.internalError('REDACTED', this.traceId);
            });

        });

    }

    private async performAddProduct(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const skuPropertyName = 'sku';
        const payload = this.eventParser.getPayload();
        const cartId = this.getCartId();
        const productSku: string = payload[skuPropertyName];

        if (cartId === null) {
            const response = ResponseBuilder.unauthorized('', this.traceId);
            return Promise.reject(response);
        }

        if (productSku === null) {
            const response = ResponseBuilder.badRequest('', this.traceId);
            return Promise.reject(response);
        }

        const keys = { cartId: cartId, sku: productSku };
        const object = this.eventParser.getPayload();

        /* tslint:disable: prefer-object-spread */
        const keyedObject = Object.assign(keys, object);

        if (!this.isValidEventBody(keyedObject)) {
            const response = ResponseBuilder.badRequest('', this.traceId);
            return Promise.reject(response);
        }

        const path = `${this.eventParser.getResource()}/${productSku}`;
        return this.putItemOnDatabase(resolver, keys, keyedObject)
        .then((result) => {

            this.publishMessage({ action: AllowedOperation.AddProduct, payload: {cartId: this.getCartId(), ...keyedObject} }, resolver)
            .catch((error) => this.publishOperationError(OperationError.DependencyError, error, 'SnsTopic', resolver));
            return ResponseBuilder.created(path, keyedObject);

        })
        .catch((reason) => {
            this.publishOperationError(OperationError.DependencyError, reason, this.tableResourceId, resolver);
            return ResponseBuilder.internalError('REDACTED', this.traceId);
        });

    }

    private async performUpdateProduct(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId();
        const productSku = this.eventParser.getPathParam('productSku');

        if (cartId === null) {
            const response = ResponseBuilder.unauthorized('', this.traceId);
            return Promise.reject(response);
        }

        if (productSku === null) {
            const response = ResponseBuilder.badRequest('', this.traceId);
            return Promise.reject(response);
        }

        const keys = { cartId: cartId, sku: productSku };
        const object = this.eventParser.getPayload();

        /* tslint:disable: prefer-object-spread */
        const keyedObject = Object.assign(keys, object);

        if (!this.isValidEventBody(keyedObject)) {
            const response = ResponseBuilder.badRequest('', this.traceId);
            return Promise.reject(response);
        }

        return this.putItemOnDatabase(resolver, keys, keyedObject)
        .then((result) => {

            this.publishMessage({ action: AllowedOperation.UpdateProduct, payload: {cartId: this.getCartId(), ...keyedObject} }, resolver)
            .catch((error) => this.publishOperationError(OperationError.DependencyError, error, 'SnsTopic', resolver));
            return ResponseBuilder.ok(keyedObject);

        })
        .catch((reason) => {
            this.publishOperationError(OperationError.DependencyError, reason, this.tableResourceId, resolver);
            return ResponseBuilder.internalError('REDACTED', this.traceId);
        });

    }

    private async putItemOnDatabase(resolver: DependencyInjector, keys: { [key: string]: any }, object: Object): Promise<boolean> {

        return new Promise((resolve, reject) => {

            resolver.getNoSQLTable()
            .then(async (dynamo) => dynamo.putItem(keys, object))
            .then((value) => resolve(true))
            /* tslint:disable no-unnecessary-callback-wrapper */
            .catch((reason) => reject(reason));

        });

    }

    private async performRemoveProduct(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId();
        const productSku = this.eventParser.getPathParam('productSku');

        if (cartId === null) {
            const response = ResponseBuilder.unauthorized('', this.traceId);
            return Promise.reject(response);
        }

        if (productSku === null) {
            const response = ResponseBuilder.badRequest('', this.traceId);
            return Promise.reject(response);
        }

        const keys = { cartId: cartId, sku: productSku };
        return resolver.getNoSQLTable()
        .then(async (dynamo) => dynamo.deleteItems(keys))
        .then((value) => {

            this.publishMessage({ action: AllowedOperation.RemoveProduct, payload: {sku: productSku }}, resolver)
            .catch((error) => this.publishOperationError(OperationError.DependencyError, error, 'SnsTopic', resolver));
            return ResponseBuilder.ok({});

        }).catch((reason) => {
            this.publishOperationError(OperationError.DependencyError, reason, this.tableResourceId, resolver);
            return ResponseBuilder.internalError('REDACTED', this.traceId);
        });

    }

    private async performConvertCart(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const newCartId = this.getCartId();
        const oldCartId = this.eventParser.getQueryParam('sessionId');
        const userId = this.eventParser.getUserId();

        if (userId !== newCartId) {
            const response = ResponseBuilder.unauthorized('', this.traceId);
            return Promise.reject(response);
        }

        if (newCartId === null) {
            const response = ResponseBuilder.unauthorized('', this.traceId);
            return Promise.reject(response);
        }

        if (oldCartId === null) {
            const response = ResponseBuilder.badRequest('', this.traceId);
            return Promise.reject(response);
        }

        const keys = { cartId: oldCartId };

        return resolver.getNoSQLTable()
        .then(async (dynamo) => {

            const values = dynamo.queryItemByHashKey(keys);
            const response: [NoSQLTable, Promise<Object[]>] = [dynamo, values];
            return response;

        })
        .then(async (tuple) => {

            const dynamo = tuple[0];
            const values = await tuple[1];

            if (values.length === 0) { return ResponseBuilder.notFound('', this.traceId); }

            const promises: Array<Promise<boolean>> = [];
            values.forEach((element) => {
                const updated = {cartId: newCartId, ...element };
                const elementSku = element[this.skuPropertyKey];
                promises.push(this.putItemOnDatabase(resolver, {cartId: newCartId, sku: elementSku }, updated));
                promises.push(dynamo.deleteItems({cartId: oldCartId, sku: elementSku }));
            });

            const responses = await Promise.all(promises);
            const falses = responses.filter((element, index, array) => !element);
            if (falses.length === 0) {

                this.publishMessage({ action: AllowedOperation.ConvertCart, payload: { oldId: oldCartId, newId: newCartId } }, resolver)
                .catch((error) => this.publishOperationError(OperationError.DependencyError, error, 'SnsTopic', resolver));
                return ResponseBuilder.ok({});

            } else {
                this.publishOperationError(OperationError.DependencyError, {message: 'UnableToRemoveItems'}, this.tableResourceId, resolver);
                return ResponseBuilder.internalError('REDACTED', this.traceId);
            }

        })
        .catch((reason) => {
            this.publishOperationError(OperationError.DependencyError, reason, this.tableResourceId, resolver);
            return ResponseBuilder.internalError('REDACTED', this.traceId);
        });

    }

    private publishOperationError(errorName: string, reason: Object, resource: string, resolver: DependencyInjector) {

        const details = (reason === null || reason == undefined) ? {} : JSON.stringify(reason);
        const operationError = ErrorBuilder.newError(OperationError.DependencyError, resource, details);
        this.publishMetric(OperationError.DependencyError, 1, resource, resolver)
        .then((result) => console.log(operationError))
        .catch((metricPublishError) => console.log(operationError));

    }

    private async publishMetric(name: string, value: number, resourceName: string, resolver: DependencyInjector): Promise<boolean> {

        return resolver.getMetricBus()
        .then(async (metricbus) => {

            const metric = new MetricBuilder(name, value).withResource(resourceName).build();
            return metricbus.publish(metric);

        })
        .catch((error) => false);

    }

    private async publishMessage(message: Object, resolver: DependencyInjector): Promise<boolean> {

        return resolver.getMessageBus()
        .then(async (messageBus) => messageBus.publish(message))
        .then((messageId) => true)
        .catch(async (error) => Promise.reject(error));

    }

}
