/* tslint:disable no-implicit-dependencies */
import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda';
import { DependencyInjector } from './dependencyInjector';
import { OperationBuilder } from './operations';

let injector: DependencyInjector = null;

export function setInjector(_injector: DependencyInjector): void { injector = _injector; }

export function handler(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {

    const resolver = (injector === null) ? new DependencyInjector(context) : injector;
    const operationBuilder = new OperationBuilder(event, context);

    operationBuilder.executeOperation(resolver)
    .then((response) => callback(null, response))
    .catch((errorResponse) => callback(null, errorResponse));

}
