import { each, toKeys } from '../utils'
import { IDataBase } from '../typings'
import Exception from './Exception'

/**
 * 实现事件监听  发布订阅模式
 */
class Listener {
	protected $eventMap: any = {}
	protected $config: any = {}
	constructor(config: IDataBase) {
		this.$config = config
	}
	public listen(name: string, fn: Function): Listener {
		const keys: string[] = toKeys(this.$config)
		if (!keys.length) {
			throw new Exception('没有找到MySql配置')
		}
		if (this.$eventMap[name]) {
			this.$eventMap[name].push(fn)
			return this
		}
		this.$eventMap[name] = [fn]
		return this
	}

	public emit(name: string, ...args): Listener {
		const listen: any[] = this.$eventMap[name] || []
		each(listen, (fn) => {
			fn(...args)
		})
		return this
	}
}
const config: IDataBase = {
	host: '127.0.0.1',
	user: 'root',
	password: 'root',
	database: 'ormtype',
}
const listener: Listener = new Listener(config)

class Query {
	constructor() {}
}

//query.name('aa') => listener.emit('name', 'aa')
