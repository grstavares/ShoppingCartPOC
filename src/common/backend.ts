import { AwsSnsMessage, InfrastructureMetric } from './types'

export interface NoSQLTable {
    getItem: (key: {[key:string]: any}) => Promise<Object>;
    queryItemByHashKey: (key: {[key:string]: any}) => Promise<Object[]>;
    queryItemByHashAndSortKey: (key: {[key:string]: any}) => Promise<Object[]>;
    putItem: (keys: { [key: string]: any }, object: Object) => Promise<boolean>;
    deleteItems: (keys: { [key: string]: any }) => Promise<boolean>;
}

export interface MessageBus {
    publish: (message: AwsSnsMessage) => Promise<string>;
}

export interface MetricBus {
    publish: (message: InfrastructureMetric) => Promise<boolean>;
}

export interface Logger {
    log:(message: string) => void;
}