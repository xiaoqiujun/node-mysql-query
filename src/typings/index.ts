export type Data = Record<string | number | symbol, unknown>

export interface IPool {
	acquireTimeout?: number //连接池超时毫秒数 默认 10000
	waitForConnections?: boolean
	connectionLimit?: number //一次允许创建的最大连接数 10
	queueLimit?: number //连接池允许排队的最大连接请求数 0
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

export interface SqlOptions extends ISql,IPool {
	charset?: string //用于连接的字符集 默认 'UTF8_GENERAL_CI'
	prefix?: string //前缀
	connectTimeout?: number //初次连接到 MySQL 服务器允许的超时毫秒数 10000
	port?:number,
	localAddress?:string,
	socketPath?:string,
	timezone?:string,
	stringifyObjects?:boolean,
	insecureAuth?:boolean,
	typeCast?:boolean,
	queryFormat?:Function,
	supportBigNumbers?:boolean,
	bigNumberStrings?:boolean,
	dateStrings?:boolean,
	debug?:boolean|object,
	trace?:boolean,
	multipleStatements?:boolean,
	flags?:string,
	ssl?:string|object
}

//查询语法树
export interface WhereSyntax {
	field: string[]
	operator: Record<string, string[]>
	condition: Record<string, any>
	keyword: Record<string, string[]>
	query: string[]
	table?:string
}

export type SQLJoin = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
//sql 排序
// DESC 指定列按降序排列 从大到小
//ASC 指定列按升序排列 从小到大
export type SQLOrder = 'DESC' | 'ASC'
export type Logic = 'AND' | 'OR'
export interface IBuildResult {
	sql: string
	values: any[]
}

export interface QueryOptions {
	table:string | string[],
	alias:Record<string, string>,
	where:WhereSyntax | WhereSyntax[],
	select:boolean
}
