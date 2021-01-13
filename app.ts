import Query from './index';
import { IDataBase } from './libs/typings';

const config: IDataBase = {
	host: '127.0.0.1',
	user: 'root',
	password: 'root',
	database: 'ormtype',
}
const query = new Query(config)
// query.name('config').where('id', 'in', [1,2,5]).limit(1,5).select()
query.name('config').where('id', 'null').limit(1,5).select()
query.name('config').where('id', 'between', [1,2]).limit(1,5).select()
