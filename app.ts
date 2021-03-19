import Db from './src';
interface IDataBase {
	host: string,
	database: string,
	user: string,
	password: string,
	prefix: string
}
const config: IDataBase = {
	host: '127.0.0.1',
	database: 'ormtype',
	user: 'root',
	password: 'root',
	prefix: 'sc_',
}
// Db.debug = true

const db = Db.connect(config)

db.name('teacher').where('id',1).select(function(query, db) {
	console.log(query)
})

