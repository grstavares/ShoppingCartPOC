/* tslint:disable no-implicit-dependencies */
import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda';
import { DependencyInjector } from './dependencyInjector';
import { OperationBuilder } from './operations';

export function handler(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {

    const resolver = new DependencyInjector(context);
    const operationBuilder = new OperationBuilder(event, context);

    operationBuilder.executeOperation(resolver)
    .then((response) => callback(null, response))
    .catch((errorResponse) => callback(null, errorResponse));

}
