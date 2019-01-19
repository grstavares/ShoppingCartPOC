import { NoSQLTable } from '../common/backend'

export class DynamoDBTable implements NoSQLTable {

    constructor(private tableName: string) { }

    public getItem(key: {[key:string]: any}):  Promise<Object> { return Promise.resolve({}) }

    public queryItemByHashKey(key: {[key:string]: any}): Promise<Object[]> { return Promise.resolve([]) }

    public queryItemByHashAndSortKey(key: {[key:string]: any}): Promise<Object[]> { return Promise.resolve([]) }

    public putItem(keys: { [key: string]: any }, object: Object): Promise<boolean> { return Promise.resolve(true) }

    public deleteItem(keys: { [key: string]: any }): Promise<boolean> { return Promise.resolve(true) }

}