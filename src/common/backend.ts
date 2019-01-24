import { InfrastructureMetric } from './types';

export enum BackendMetrics {
    DependencyNotConfigured = 'DependencyNotConfigured',
    DependencyNotAvailable = 'DependencyNotAvailable',
}

export interface NoSQLTable {
    getItem(keys: {[key: string]: any}): Promise<Object>;
    queryItemByHashKey(keys: {[key: string]: any}): Promise<Object[]>;
    putItem(keys: { [key: string]: any }, object: Object): Promise<boolean>;
    deleteItems(keys: { [key: string]: any }): Promise<boolean>;
}

export interface MessageBus {
    publish(message: Object): Promise<string>;
}

export interface MetricBus {
    publish(message: InfrastructureMetric): Promise<boolean>;
}

export interface Logger {
    log(message: string): void;
}

export interface InputParser {
    getHttpMethod(): string;
    getUserId(): string;
    getPathParam(name: string): string;
    getQueryParam(name: string): string;
    getResource(): string;
    getPayload(): Object;
}

export interface DependencyInjector {
    getNoSQLTable(): Promise<NoSQLTable>;
    getMessageBus(): Promise<MessageBus>;
    getMetricBus(): Promise<MetricBus>;
    getInputParser(event: any): InputParser;
}
