import Query from './index'
import { IDataBase } from './libs/typings'

const config: IDataBase = {
	host: '127.0.0.1',
	user: 'root',
	password: 'root',
	database: 'typeorm',
	prefix: 'orm_',
}
const query = new Query(config)
// query.name('teacher').where('id', '>', 1).update({
// 	age: 43,
// 	name: '王五',
// })
query.name('teacher').where('id', '>', 1).delete()
// query.name('config').where('id', 'null').limit(1,5).select()
// query.name('config').where('id', 'in', [1,2,5]).limit(1,5).select()
// query.name('config').where('id', 'between', [1,2]).where("name", 'like', "标题").limit(1,5).select()
// query.name('config').where('id', '1').update({

// })
// let data = new Array(1000000).fill({name:'一号', age:36})
// console.log(data)
// query.name('config').insert(data)

// query.name("demo_site")
// 	.where({
// 		id: ['>', 1],
// 		title: [['like', 'JS%'], 'or', ['like', '%JS']],
// 		name: [
// 			['<>', 'JS'],
// 			['<>', 'Node'],
// 		],
// 	}).whereOr('desc', '').alias("a").join("demo_config c", "a.configID = c.id").join("demo_student d", "d.id = c.id", 'LEFT').limit(1,5).select()
