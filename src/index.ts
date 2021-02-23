import Query from './core/Query';
import { IDataBase } from './typings';

class Db  {
	private static _instance:Query
	public static connect(config:IDataBase) {
		if(!this._instance) {
			this._instance = new Query(config);
		}
		return this._instance
	}
	public static get debug() {
		return Query.debug
	}
	public static set debug(value: boolean) {
		Query.debug = value
	}
}

export default Db