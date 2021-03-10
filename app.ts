import Db from './src/index'

interface IDataBase {
	host: string
	database: string
	user: string
	password: string
	prefix: string,
	queueLimit:number
}
const config: IDataBase = {
	host: '127.0.0.1',
	database: 'ormtype',
	user: 'root',
	password: 'root',
	prefix: 'orm_',
	queueLimit:5
}
const db = Db.connect(config)
db.name('teacher')
	.where('name', 'not null')
	.find()
	.then((res) => {
		console.log(res)
	})

setTimeout(() => {
	db.name('teacher')
		.where('name', 'not null')
		.find()
		.then((res) => {
			console.log(res)
		})
}, 5000)
