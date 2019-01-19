import { Context, Callback, APIGatewayProxyEvent } from 'aws-lambda';
import { OperationBuilder } from './operations';
import { DependencyInjector } from './dependencyInjector';

export function handler (event: APIGatewayProxyEvent, context: Context, callback: Callback): void {
    
    const resolver = new DependencyInjector(context);
    const operationBuilder = new OperationBuilder(event, context)
    
    operationBuilder.executeOperation(resolver)
    .then(response => callback(null, response))
    .catch(errorResponse => callback(null, errorResponse))

}