import { IDataBase } from '../typings';
export default class Db {
    private static instance;
    static connect(config: IDataBase): Db;
    static clear(): void;
}
