/* tslint:disable no-implicit-dependencies */
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { APIGatewayEventParser } from './aws/apigatewayeventparser';
import { ResponseBuilder, NoSQLTable } from './common';
import { APIGatewayResponse } from './common/types';
import { DependencyInjector } from './dependencyInjector';
import { CartProduct } from './objectSchemas';

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
}

export class OperationBuilder {

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
            .then((dynamo) => dynamo.queryItemByHashKey(keys))
            .then((values) => {

                if (values.length > 0) {

                    const response = ResponseBuilder.ok(values);
                    resolve(response);

                } else { reject(ResponseBuilder.notFound(JSON.stringify(keys), this.traceId)); }

            }).catch((reason) => {

                const response = ResponseBuilder.internalError('REDACTED', this.traceId);
                reject(response);

            });

        });

    }

    private async performRemoveAllProducts(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId();

        if (cartId === null) {
            const response = ResponseBuilder.unauthorized('', this.traceId);
            return Promise.reject(response);
        }

        const keys = { cartId: cartId };
        return new Promise((resolve, reject) => {

            let dynamoTable: NoSQLTable;

            resolver.getNoSQLTable()
            .then(async (dynamo) => {
                dynamoTable = dynamo;
                return dynamo.queryItemByHashKey(keys);
            })
            .then((values) => {

                if (values.length === 0) { return [true];
                } else {

                    const promises: Array<Promise<boolean>> = [];
                    values.forEach((value, index) => {
                        /* tslint:disable: no-string-literal */
                        const objectKeys = {cartId: value['cartId'], sku: value['sku']};
                        promises.push(dynamoTable.deleteItems(objectKeys));
                    });

                    return Promise.all(promises);

                }

            })
            .then((value) => {

                const response = ResponseBuilder.ok({});
                resolve(response);

            }).catch((reason) => {

                const response = ResponseBuilder.internalError('REDACTED', this.traceId);
                reject(response);

            });

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
            .then((dynamo) => dynamo.getItem(keys))
            .then((value) => {

                if (value !== null && value !== undefined) {

                    const response = ResponseBuilder.ok(value);
                    resolve(response);

                } else {

                    const response = ResponseBuilder.notFound(JSON.stringify(keys), this.traceId);
                    reject(response);

                }

            }).catch((reason) => {

                const response = ResponseBuilder.internalError('REDACTED', this.traceId);
                reject(response);

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
        .then((result) => ResponseBuilder.created(path, keyedObject))
        .catch((reason) => ResponseBuilder.internalError(reason, this.traceId));

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
        .then((result) => ResponseBuilder.ok(keyedObject))
        .catch((reason) => ResponseBuilder.internalError(reason, this.traceId));

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

        // const dynamodb = resolver.getNoSQLTable();

        const keys = { cartId: cartId, sku: productSku };
        return new Promise((resolve, reject) => {

            resolver.getNoSQLTable()
            .then((dynamo) => dynamo.deleteItems(keys))
            .then((value) => {

                const response = ResponseBuilder.ok({});
                resolve(response);

            }).catch((reason) => {

                const response = ResponseBuilder.internalError('REDACTED', this.traceId);
                reject(response);

            });

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
        return new Promise((resolve, reject) => {

            let dynamoTable: NoSQLTable;

            resolver.getNoSQLTable()
            .then(async (dynamo) => {
                dynamoTable = dynamo;
                return dynamo.queryItemByHashKey(keys);
            })
            .then(async (values) => {

                if (values.length === 0) {
                    reject(ResponseBuilder.notFound('', this.traceId));
                    return undefined;
                }

                const promises: Array<Promise<boolean>> = [];
                values.forEach((element) => {
                    const updated = {cartId: newCartId, ...element };
                    const elementSku = element['sku'];
                    promises.push(this.putItemOnDatabase(resolver, {cartId: newCartId, sku: elementSku }, updated));
                    promises.push(dynamoTable.deleteItems({cartId: oldCartId, sku: elementSku }));
                });

                return Promise.all(promises);

            })
            .then((resultOk) => resolve(ResponseBuilder.ok({})))
            .catch((reason) => reject(ResponseBuilder.internalError('REDACTED', this.traceId)));

        });

    }

}
