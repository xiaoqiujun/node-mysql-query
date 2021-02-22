import { IBuildResult, IDataBase } from '../typings';
export default class Db {
    private readonly connection;
    private static _instance;
    private static configMap;
    private static _connection;
    constructor(connection: any);
    static connect(config: IDataBase): Db;
    static clear(): void;
    getConfig(key: string): any;
    format(options: IBuildResult): string;
    query(options: IBuildResult | string): Promise<any[]>;
    exec(options: IBuildResult | string): Promise<any[]>;
}
