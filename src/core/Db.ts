import mysql, { Connection, QueryError, Pool } from 'mysql2'
import { IDataBase, IPool, ISql, sqlExceptionEnum } from '../typings'
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
	private static _instance: Connection | Pool
	private static configMap: Map<any, any> = new Map()
	public static connect(config: IDataBase): Db {
		const pool: boolean | IPool | undefined = config.pool
		const $config = Object.create(null)
		Object.keys(config).forEach((key:any) => {
			if (!Db.configMap.has(key)) Db.configMap.set(key, config[key]);
			if([].concat(CONNECTION_OPTIONS, pool === true ? POOL_OPTIONs : []).includes(key as never)) {
				$config[key] = config[key]
			}
		})
		if (!this._instance) {
			if (pool === true) {
				this._instance = mysql.createPool($config)
			} else {
				this._instance = mysql.createConnection($config)
				this._instance.connect((err: QueryError | null) => {
					if (err) {
						throw new Exception(err.message)
					}
				})
			}
		}
		return this._instance
	}
	public static clear() {
		if (this._instance) {
			this._instance.destroy()
		}
	}
	public static getConfig(key: string): any {
		if (Db.configMap.has(key)) return Db.configMap.get(key);
		return null;
	}
}
