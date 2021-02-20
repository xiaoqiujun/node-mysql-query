import Query from './src/core/Query'
import { IDataBase } from './src/typings'
const config: IDataBase = {
	host: '127.0.0.1',
	user: 'root',
	password: 'root',
	database: 'school',
	prefix: 'sc_',
}
const query = new Query(config)
query.name('teacher').where('id', 'egt', 1).update({
	age: 43,
	name: '王五',
})
query.table('teacher').where('id', '>', 10).select();
query.name('teacher').where('id', '>', 1).delete()
query.name('config').where('id', 'null').limit(1,5).select()
query.name('config').where('id', 'in', [1,2,5]).limit(1,5).select()
query.name('config').where('id', 'between', [1,2]).where("name", 'like', "标题").limit(1,5).select()
query.name('config').where('id', '1').update({})
let data = new Array(10).fill({name:'一号', age:36})
query.name('config').insert(data)
query.name("demo_site")
	.where({
		id: ['>', 1],
		title: [['like', 'JS%'], 'or', ['like', '%JS']],
		name: [
			['<>', 'JS'],
			['<>', 'Node'],
		],
	}).whereOr('desc', '').alias("a").select()
// query.name("demo_site")
// 	.where({
// 		id: ['>', 1],
// 		title: [['like', 'JS%'], 'or', ['like', '%JS']],
// 		name: [
// 			['<>', 'JS'],
// 			['<>', 'Node'],
// 		],
// 	}).whereOr('desc', '').alias("a").join("demo_config c", "a.configID = c.id").join("demo_student d", "d.id = c.id", 'LEFT').limit(1,5).select()
