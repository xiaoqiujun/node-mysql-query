import mysql, { Connection, QueryError, Pool } from 'mysql2'
import { IDataBase, IPool, ISql, sqlExceptionEnum } from '../typings'
export default class Db {
	//数据库实例
	private static instance: Connection | Pool
	public static connect(config: IDataBase): Db {
		console.log('测试执行')
		if (!this.instance) {
			if (config.pool === true) {
				this.instance = mysql.createPool(config)
			} else {
				this.instance = mysql.createConnection(config)
				this.instance.connect((err: QueryError | null) => {
					if (err) {
						throw new Error(sqlExceptionEnum[err?.code])
					}
				})
			}
		}
		return this.instance
	}
	public static clear() {
		if (this.instance) {
			this.instance.destroy()
		}
	}
}
