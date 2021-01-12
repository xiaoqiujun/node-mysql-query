import mysql, { Connection, QueryError, Pool } from 'mysql2'
import { IDataBase, IPool, ISql, sqlExceptionEnum } from '../typings'
export default class Db {
	//数据库实例
	private static _instance: Connection | Pool
	public static connect(config: IDataBase): Db {
		console.log('测试执行')
		if (!this._instance) {
			if (config.pool === true) {
				this._instance = mysql.createPool(config)
			} else {
				this._instance = mysql.createConnection(config)
				this._instance.connect((err: QueryError | null) => {
					if (err) {
						throw new Error(sqlExceptionEnum[err?.code])
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
}
