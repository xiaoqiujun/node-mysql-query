import Query from './core/Query';
import { IDataBase } from './typings';
declare class db extends Query {
    constructor(config: IDataBase);
}
export default db;
