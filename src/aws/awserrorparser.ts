/* tslint:disable: no-implicit-dependencies */
import { ServiceError } from '../common/types';
import { AWSError } from 'aws-sdk';

/* tslint:disable: no-unnecessary-class */
export class AWSErrorParser {

    public static parseAWSError(error: AWSError, resource: { type: string; name: string }): ServiceError {

        let errorCode  = 'undefined';
        let httpCode = 500;
        const resourceDescription = JSON.stringify(resource);

        switch (error.code.toLowerCase()) {
            case 'networkingerror':
                errorCode = 'NetworkError';
                httpCode = 500;
                break;
            case 'missingrequiredparameter':
                errorCode = 'InvalidObjectBody';
                httpCode = 400;
                break;
            default:
                console.log('AWSError not identified!');
                console.log(error);
        }

        return {logTag: 'ERROR::', code: errorCode, httpStatusCode: httpCode, resource: resourceDescription, payload: error};

    }

}
