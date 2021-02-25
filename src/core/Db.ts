import { isArray, isStr, thread } from '../utils'
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
	private static _connection:any
	constructor(private readonly connection:any) {
		Db._connection = connection
	}
	public static connect(config: IDataBase): Db {
		const pool: boolean | IPool | undefined = config.pool
		const $config = Object.create(null)
		let connection:any
		Object.keys(config).forEach((key:any) => {
			if (!Db.configMap.has(key)) Db.configMap.set(key, config[key]);
			if([].concat(CONNECTION_OPTIONS, pool === true ? POOL_OPTIONs : []).includes(key as never)) {
				$config[key] = config[key]
			}
		})
		if (!this._instance) {
			if (pool === true) {
				connection = mysql.createPool($config)
			} else {
				connection = mysql.createConnection($config)
			}
			this._instance = new Db(connection)
		}
		return this._instance
	}
	public static clear() {
		this._instance = null
		this._connection = null
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
	public async query(options:IBuildResult|string):Promise<any[]> {
		if(!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if(Db._connection) {
			try {
				if(!this.getConfig('pool')) {
					Db._connection.connect(() => {})
					const promiseConn:Connection = Db._connection.promise()
					const res:any = isStr(options) ? await promiseConn.query(options as string) : await promiseConn.query((options as IBuildResult).sql, (options as IBuildResult).values)
					promiseConn.end()
					return res
				}
				const promisePool:PoolConnection = await Db._connection.promise().getConnection()
				const res:any = isStr(options) ? await promisePool.query(options as string) : await promisePool.query((options as IBuildResult).sql, (options as IBuildResult).values)
				promisePool.release()
				return res
			}catch (err) {
				throw err
			}
		}
		return []
	}
	public async exec(options:IBuildResult|string):Promise<any[]> {
		if(!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if(Db._connection) {
			try {
				if(!this.getConfig('pool')) {
					Db._connection.connect(() => {})
					const promiseConn:Connection = Db._connection.promise()
					const res:any = isStr(options) ? await promiseConn.execute(options as string) : await promiseConn.execute((options as IBuildResult).sql, (options as IBuildResult).values)
					promiseConn.end()
					return res
				}
				const promisePool:PoolConnection = await Db._connection.promise().getConnection()
				const res:any = isStr(options) ? await promisePool.execute(options as string) : await promisePool.execute((options as IBuildResult).sql, (options as IBuildResult).values)
				promisePool.release()
				return res
			}catch (err) {
				throw err
			}
		}
		return []
	}

	public async transaction(options:IBuildResult[]|string[]):Promise<boolean> {
		if(!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if(Db._connection) {
			try {
				const promisePool = await Db._connection.getConnection()
				await promisePool.beginTransaction()
				if(!isArray(options)) throw new Exception(`事务参数是数组类型`)
				for(let i:number = 0; i < options.length; i++) {
					let item:any = options[i]
					const [rows]:any = isStr(item) ? await promisePool.query(item) : await promisePool.query(item.sql, item.values)
					if(rows.length > 0) {
						continue
					}
				}
				await promisePool.commit()
				promisePool.release()
				return true
			}catch (err) {
				throw err
			}
		}
		return false
	}
}
