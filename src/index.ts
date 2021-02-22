import Query from './core/Query';
import { IDataBase } from './typings';

class db extends Query {
	constructor(config:IDataBase) {
		super(config);
	}
}

export default db