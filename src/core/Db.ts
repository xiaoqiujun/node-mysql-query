import { thread } from '../utils'
import mysql, { Connection, QueryError, Pool, PoolConnection } from 'mysql2'
import { IBuildResult, IDataBase, IPool, ISql, sqlExceptionEnum } from '../typings'
import Exception from './Exception'
const CONNECTION_OPTIONS:any = [
	'host',
	'port',
	'localAddress',
	'socketPath',
	'user',
	'password',
	'database',
	'charset',
	'timezone',
	'connectTimeout',
	'stringifyObjects',
	'insecureAuth',
	'typeCast',
	'queryFormat',
	'supportBigNumbers',
	'bigNumberStrings',
	'dateStrings',
	'debug',
	'trace',
	'multipleStatements',
	'flags',
	'ssl'
]
const POOL_OPTIONs: any = [
	'acquireTimeout',
	'waitForConnections',
	'connectionLimit',
	'queueLimit'
]
export default class Db {
	//数据库实例
	private static _instance: Db | null
	private static configMap: Map<any, any> = new Map()
	private static _connection:Connection | Pool | null
	constructor(private readonly connection:Connection| Pool) {
		Db._connection = connection
	}
	public static connect(config: IDataBase): Db {
		const pool: boolean | IPool | undefined = config.pool
		const $config = Object.create(null)
		let connection:Connection | Pool
		Object.keys(config).forEach((key:any) => {
			if (!Db.configMap.has(key)) Db.configMap.set(key, config[key]);
			if([].concat(CONNECTION_OPTIONS, pool === true ? POOL_OPTIONs : []).includes(key as never)) {
				$config[key] = config[key]
			}
		})
		if (!this._instance) {
			if (pool === true) {
				connection = mysql.createPool($config)
				connection.getConnection((err:NodeJS.ErrnoException, conn:PoolConnection) => {
					if(err) throw new Exception(err.message)
				})
			} else {
				connection = mysql.createConnection($config)
				connection.connect((err: QueryError | null) => {
					if (err) {
						throw new Exception(err.message)
					}
				})
			}
			this._instance = new Db(connection)
		}
		return this._instance
	}
	public static clear() {
		if (this._instance && this._connection) {
			this._connection.destroy()
			this._instance = null
			this._connection = null
		}
	}
	public getConfig(key: string): any {
		if (Db.configMap.has(key)) return Db.configMap.get(key);
		return null;
	}
	public format(options:IBuildResult):string {
		if(!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if(Db._connection) {
			const sql:string = Db._connection.format(options.sql, options.values)
			return sql
		}
		return ''
	}
	public async query(options:IBuildResult):Promise<any[]> {
		if(!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if(Db._connection) {
			const promiseConn = Db._connection.promise()
			try {
				const res = await promiseConn.query(options.sql, options.values)
				return res
			}catch (err:any) {
				throw err
			}
		}
		return []
	}
	public async exec(options:IBuildResult):Promise<any[]> {
		if(!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if(Db._connection) {
			const promiseConn = Db._connection.promise()
			try {
				const res = await promiseConn.execute(options.sql, options.values)
				return res
			}catch (err:any) {
				throw err
			}
		}
		return []
	}
}
