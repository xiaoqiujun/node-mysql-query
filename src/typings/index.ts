export interface IPool {
	acquireTimeout: number //连接池超时毫秒数 默认 10000
	waitForConnections: boolean
	connectionLimit: number //一次允许创建的最大连接数 10
	queueLimit: number //连接池允许排队的最大连接请求数 0
}
export interface IObject {
	[key: string]: any
}
export interface ISql {
	host: string
	database: string
	user: string
	password: string
}
export interface IDataBase extends ISql {
	charset?: string //用于连接的字符集 默认 'UTF8_GENERAL_CI'
	prefix?: string //前缀
	pool?: boolean | IPool //连接池
	connectTimeout?: number //初次连接到 MySQL 服务器允许的超时毫秒数 10000
}
export enum sqlExceptionEnum {
	ECONNREFUSED = '[ConnectError] SQL拒接连接',
	ER_PARSE_ERROR = '[SyntaxError] SQL语法解析错误',
}
//查询语法树
export interface IWhereSyntaxTree {
	field: string[]
	operator: IObject
	condition: IObject
	keyword: IObject
	query: string[]
}
//sql join枚举
export enum sqlJoinTypeEnum {
	INNER = 'INNER',
	LEFT = 'LEFT',
	RIGHT = 'RIGHT',
	FULL = 'FULL',
}
export type sqlJoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
//sql 排序枚举
export enum sqlOrderEnum {
	DESC = 'DESC', //指定列按降序排列 从大到小
	ASC = 'ASC', //指定列按升序排列 从小到大
}
export type sqlOrderType = 'DESC' | 'ASC'
export type logicType = 'AND' | 'OR'
export interface IBuildResult {
	sql: string
	params: any[]
}
