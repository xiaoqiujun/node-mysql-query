import Db from './src/index'

interface IDataBase {
	host: string
	database: string
	user: string
	password: string
	prefix: string
}
const config: IDataBase = {
	host: '127.0.0.1',
	database: 'typeorm',
	user: 'root',
	password: 'root',
	prefix: 'orm_',
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
}, 3000)
