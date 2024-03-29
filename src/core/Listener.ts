import { each, toKeys } from '../utils'
import { SqlOptions } from '../typings'
import Exception from './Exception'

/**
 * 实现事件监听  发布订阅模式
 */
class Listener {
	protected _eventMap: any = {}
	protected _config: any = {}
	constructor(config: SqlOptions) {
		this._config = config
	}
	public listen(name: string, fn: Function): Listener {
		const keys: string[] = toKeys(this._config)
		if (!keys.length) {
			throw new Exception('没有找到MySql配置')
		}
		if (this._eventMap[name]) {
			this._eventMap[name].push(fn)
			return this
		}
		this._eventMap[name] = [fn]
		return this
	}

	public emit(name: string, ...args): Listener {
		const listen: any[] = this._eventMap[name] || []
		each(listen, (fn) => {
			fn(...args)
		})
		return this
	}
}

//query.name('aa') => listener.emit('name', 'aa')
