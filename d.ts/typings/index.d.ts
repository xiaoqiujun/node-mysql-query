export interface IPool {
    acquireTimeout: number;
    waitForConnections: boolean;
    connectionLimit: number;
    queueLimit: number;
}
export interface IObject {
    [key: string]: any;
}
export interface ISql {
    host: string;
    database: string;
    user: string;
    password: string;
}
export interface IDataBase extends ISql {
    charset?: string;
    prefix?: string;
    pool?: boolean | IPool;
    connectTimeout?: number;
}
export declare enum sqlExceptionEnum {
    ECONNREFUSED = "[ConnectError] SQL\u62D2\u63A5\u8FDE\u63A5",
    ER_PARSE_ERROR = "[SyntaxError] SQL\u8BED\u6CD5\u89E3\u6790\u9519\u8BEF"
}
export interface IWhereSyntaxTree {
    field: string[];
    operator: IObject;
    condition: IObject;
    keyword: IObject;
    query: string[];
}
export declare enum sqlJoinTypeEnum {
    INNER = "INNER",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    FULL = "FULL"
}
export declare type sqlJoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
export declare enum sqlOrderEnum {
    DESC = "DESC",
    ASC = "ASC"
}
export declare type sqlOrderType = 'DESC' | 'ASC';
export declare type logicType = 'AND' | 'OR';
