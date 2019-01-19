import { Context, APIGatewayProxyEvent } from 'aws-lambda';

import { APIGatewayResponse } from './common/types';
import { ResponseBuilder } from './common'

import { APIGatewayEventParser } from './aws/apigatewayeventparser';

import { CartProduct } from './objectSchemas';
import { DependencyInjector } from './dependencyInjector';

export enum AllowedOperation {
    GetAllProducts = 'GetAllProducts',
    RemoveAllProducts = "RemoveAllProducts",
    GetProduct = 'GetProduct',
    AddProduct = 'AddProduct',
    UpdateProduct = 'UpdateProduct',
    RemoveProduct = "RemoveProduct",
    ConvertCart = "ConvertCart"
}

export enum OperationError {
    ResourceNotFound = "ResourceNotFound"
}

export class OperationBuilder {

    traceId: string
    eventParser: APIGatewayEventParser

    constructor(private event: APIGatewayProxyEvent, private context: Context) { 

        this.traceId = context.awsRequestId
        this.eventParser = new APIGatewayEventParser(event)

    }

    getOperation(): AllowedOperation {
    
        const resource = this.event.resource
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

    executeOperation(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const operation = this.getOperation()
        switch (operation) {
            case 'GetAllProducts': { return this.performGetAllProducts(resolver) }
            case 'RemoveAllProducts': { return this.performRemoveAllProducts(resolver) }
            case 'GetProduct': { return this.performGetProduct(resolver) }
            case 'AddProduct': { return this.performAddProduct(resolver) }
            case 'UpdateProduct': { return this.performUpdateProduct(resolver) }
            case 'RemoveProduct': { return this.performRemoveProduct(resolver) }
            case 'ConvertCart': { return this.performConvertCart(resolver) }
            default: {

                const response = ResponseBuilder.badRequest("Invalid Request Method", this.traceId);
                return Promise.reject(response)

            }
        }

    }

    private performGetAllProducts(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId()

        if (cartId == null) {
            const response = ResponseBuilder.unauthorized("", this.traceId)
            return Promise.reject(response)
        }

        let dynamodb = resolver.getNoSQLTable()
        
        const keys = { "cartId": cartId }
        return new Promise((resolve, reject) => {

            dynamodb.queryItemByHashKey(keys)
            .then(values => {
    
                if (values.length > 0) { 
                    
                    const response = ResponseBuilder.ok(values)
                    resolve(response)

                } else { reject(ResponseBuilder.notFound(JSON.stringify(keys), this.traceId)) } 
    
            }).catch(reason => {
    
                let response = ResponseBuilder.internalError("REDACTED", this.traceId)
                reject(response)
    
            })

        });

    }
    
    private performRemoveAllProducts(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId()

        if (cartId == null) {
            const response = ResponseBuilder.unauthorized("", this.traceId)
            return Promise.reject(response)
        }

        let dynamodb = resolver.getNoSQLTable()
        
        const keys = { "cartId": cartId }
        return new Promise((resolve, reject) => {

            dynamodb.deleteItems(keys)
            .then(value => {
    
                let response = ResponseBuilder.ok({})
                resolve(response);
    
            }).catch(reason => {
    
                let response = ResponseBuilder.internalError("REDACTED", this.traceId)
                reject(response)
    
            })

        });

    }
    
    private performGetProduct(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId()
        const productSku = this.eventParser.getPathParam("productSku")

        if (cartId == null) {
            const response = ResponseBuilder.unauthorized("", this.traceId)
            return Promise.reject(response)
        }

        if (productSku == null) {
            const response = ResponseBuilder.badRequest("", this.traceId)
            return Promise.reject(response)
        }

        let dynamodb = resolver.getNoSQLTable()

        const keys = { "cartId": cartId, "sku": productSku }
        return new Promise((resolve, reject) => {

            dynamodb.getItem(keys)
            .then(value => {
    
                if (value != null && value != undefined) {

                    let response = ResponseBuilder.ok(value)
                    resolve(response);

                } else { 

                    const response = ResponseBuilder.notFound(JSON.stringify(keys), this.traceId)
                    reject(response)

                }
    
            }).catch(reason => {
    
                let response = ResponseBuilder.internalError("REDACTED", this.traceId)
                reject(response)
    
            })

        });

    }
    
    private performAddProduct(resolver: DependencyInjector): Promise<APIGatewayResponse> { return this.performUpdateProduct(resolver) }
    
    private performUpdateProduct(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId()
        const productSku = this.eventParser.getPathParam("productSku")

        if (cartId == null) {
            const response = ResponseBuilder.unauthorized("", this.traceId)
            return Promise.reject(response)
        }

        if (productSku == null) {
            const response = ResponseBuilder.badRequest("", this.traceId)
            return Promise.reject(response)
        }

        const keys = { "cartId": cartId, "sku": productSku }
        const object = this.eventParser.getPayload();
        const keyedObject = Object.assign(keys, object)

        if (!this.isValidEventBody(keyedObject)) {
            const response = ResponseBuilder.badRequest("", this.traceId)
            return Promise.reject(response)
        }

        let dynamodb = resolver.getNoSQLTable()

        return new Promise((resolve, reject) => {

            dynamodb.putItem(keys, keyedObject)
            .then(value => {
    
                if (value != null && value != undefined) {

                    let response = ResponseBuilder.ok(keyedObject)
                    resolve(response);

                } else { 

                    const response = ResponseBuilder.notFound(JSON.stringify(keyedObject), this.traceId)
                    reject(response)

                }
    
            }).catch(reason => {
    
                let response = ResponseBuilder.internalError("REDACTED", this.traceId)
                reject(response)
    
            })

        });

    }
    
    private performRemoveProduct(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        const cartId = this.getCartId()
        const productSku = this.eventParser.getPathParam("productSku")

        if (cartId == null) {
            const response = ResponseBuilder.unauthorized("", this.traceId)
            return Promise.reject(response)
        }

        if (productSku == null) {
            const response = ResponseBuilder.badRequest("", this.traceId)
            return Promise.reject(response)
        }

        let dynamodb = resolver.getNoSQLTable()

        const keys = { "cartId": cartId, "sku": productSku }
        return new Promise((resolve, reject) => {

            dynamodb.deleteItems(keys)
            .then(value => {

                let response = ResponseBuilder.ok({})
                resolve(response);
    
            }).catch(reason => {
    
                let response = ResponseBuilder.internalError("REDACTED", this.traceId)
                reject(response)
    
            })

        });

    }
    
    private performConvertCart(resolver: DependencyInjector): Promise<APIGatewayResponse> {

        return Promise.reject()

    }

    getCartId(): string {

        const userId = this.eventParser.getUserId()
        if (userId != null && userId != undefined) { return userId }

        const sessionId = this.eventParser.getQueryParam("sessionId")
        if (this.isValidSessionId(sessionId)) { return sessionId }

        return null

    }

    isValidEventBody(object: any): object is CartProduct { 
    
        if (object.sku == undefined) { return false }
        if (object.name == undefined) { return false }
        if (object.price == undefined) { return false }
        if (object.quantity == undefined) { return false }
        return true
    
    }

    isValidSessionId(session: string) { 

        if (session == null || session == undefined) { return false }

        //Check SessionId Format
        return true

    }

}