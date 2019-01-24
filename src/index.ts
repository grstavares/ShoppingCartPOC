/* tslint:disable no-implicit-dependencies */
import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda';
import { DependencyInjector } from './common/backend';
import { AWSDependencyInjector } from './aws/injector';
import { OperationBuilder } from './operations';

let injector: DependencyInjector = null;

export function setInjector(_injector: DependencyInjector): void { injector = _injector; }

export function handler(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {

    const resolver = (injector === null) ? new AWSDependencyInjector(context) : injector;
    const eventParser = injector.getInputParser(event);
    const operationBuilder = new OperationBuilder(eventParser, context.awsRequestId);

    operationBuilder.executeOperation(resolver)
    .then((response) => callback(null, response))
    .catch((errorResponse) => callback(null, errorResponse));

}
