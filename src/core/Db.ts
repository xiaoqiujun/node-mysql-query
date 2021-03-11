import { each, has, isArray, isStr, thread } from '../utils'
import mysql, { Pool, PoolConnection } from 'mysql2'
import { IBuildResult, IDataBase, IPool, ISql, sqlExceptionEnum } from '../typings'
import Exception from './Exception'
const CONNECTION_OPTIONS: any = [
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
	'ssl',
]
const POOL_OPTIONS: any = ['acquireTimeout', 'waitForConnections', 'connectionLimit', 'queueLimit']
export default class Db {
	//数据库实例
	private static _instance: Db = new Db()
	private static config: object = Object.create(null)
	private static _connection: any
	public static connect(config: IDataBase): Db {
		const $config = Object.create(null)
		Object.keys(config).forEach((key: any) => {
			if ([].concat(CONNECTION_OPTIONS, POOL_OPTIONS).includes(key as never)) {
				$config[key] = config[key]
			}
		})
		this.config = $config
		this._connection = mysql.createPool($config)
		return this._instance
	}
	private reConnect() {
		if(!Db._connection._closed) return 
		Db.end()
		Db._connection = mysql.createPool(Db.config)
	}
	public static end() {
		this._connection.end()
		this._connection = null
	}
	public getConfig(key: string): any {
		if(has(Db.config, key)) return Db.config[key]
		return null
	}
	public format(options: IBuildResult): string {
		if (!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if (Db._connection) {
			const sql: string = Db._connection.format(options.sql, options.values)
			return sql
		}
		return ''
	}
	public async query(options: IBuildResult | string): Promise<any[]> {
		if (!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if (Db._connection) {
			this.reConnect()
			try {
				const promisePool = await Db._connection.promise().getConnection()
				
				const res: any = isStr(options)
					? await promisePool.query(options as string)
					: await promisePool.query((options as IBuildResult).sql, (options as IBuildResult).values)
				promisePool.release()
				return res
			} catch (err) {
				throw err
			}
		}
		return []
	}
	public async exec(options: IBuildResult | string): Promise<any[]> {
		if (!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if (Db._connection) {
			this.reConnect()
			try {
				const promisePool = await Db._connection.promise().getConnection()
				const res: any = isStr(options)
					? await promisePool.execute(options as string)
					: await promisePool.execute((options as IBuildResult).sql, (options as IBuildResult).values)
				promisePool.release()
				return res
			} catch (err) {
				throw err
			}
		}
		return []
	}

	public async transaction(options: IBuildResult[] | string[]): Promise<boolean> {
		if (!Db._instance && !Db._connection) throw new Exception('Db实例不存在')
		if (Db._connection) {
			try {
				const promisePool = await Db._connection.getConnection()
				await promisePool.beginTransaction()
				if (!isArray(options)) throw new Exception(`事务参数是数组类型`)
				for (let i: number = 0; i < options.length; i++) {
					let item: any = options[i]
					const [rows]: any = isStr(item)
						? await promisePool.query(item)
						: await promisePool.query(item.sql, item.values)
					if (rows.length > 0) {
						continue
					}
				}
				await promisePool.commit()
				promisePool.release()
				return true
			} catch (err) {
				throw err
			}
		}
		return false
	}
}
