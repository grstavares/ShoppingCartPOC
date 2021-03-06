/* tslint:disable no-implicit-dependencies */
import { APIGatewayProxyEvent, Callback, Context } from 'aws-lambda';
import { DependencyInjector } from './common/backend';
import { AWSDependencyInjector } from './aws/injector';
import { OperationBuilder } from './operations';

let injector: DependencyInjector = null;

export function setInjector(_injector: DependencyInjector): void { injector = _injector; }

export function handler(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {

    const resolver = (injector === null) ? new AWSDependencyInjector(context.awsRequestId) : injector;
    const eventParser = resolver.getInputParser(event);
    const logger = resolver.getLogger();
    const operationBuilder = new OperationBuilder(eventParser, context.awsRequestId);

    operationBuilder.executeOperation(resolver)
    .then((response) => { logger.log(`Response Returned -> StatusCode ${response.statusCode}`); callback(null, response); })
    .catch((errorResponse) => { logger.logError(JSON.stringify(errorResponse)); callback(null, errorResponse); });

}
