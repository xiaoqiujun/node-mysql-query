import Query from './dist'
import { IDataBase } from './src/typings'

const config: IDataBase = {
	host: '127.0.0.1',
	user: 'root',
	password: 'root',
	database: 'school',
	prefix: 'sc_',
	pool:true
}
Query.debug = true
const query = new Query(config)
let res = query
	.name('mood')
	.comment("插入数据")
	.insert(
		[
			{
				user_id: 365,
				content: '1 or 1 --',
				visible: 1,
				add_time: new Date(),
			},
			{
				user_id: 78,
				content: '测试2',
				visible: 2,
				add_time: new Date(),
			},
		]
	)
	.then((res) => {
		console.log(res)
	})
// let res = query.name('teacher').where('username', '').select(function(query, db) {
// 	console.log(db.format(query))
// }).then(res => {
// 	console.log(res)
// })
// let res = query.table('sc_teacher').where('id', 'between', [1,2]).comment("这是注释").select(function(res, packet, ctx) {
// 	console.log(11)
// 	console.log(res)
// })
// console.log(res)
query.table('sc_teacher').where('id', 'between', [1, 2]).select().then(res => {
	console.log(res)
})
// query.table('sc_mood').where('id', 'between', [127, 128]).delete()
// query.name('teacher').where('id', '>', 1).delete()
// query.name('config').where('id', 'null').limit(1,5).select()
// query.name('config').where('id', 'in', [1,2,5]).limit(1,5).select()
// query.name('config').where('id', 'between', [1,2]).where("name", 'like', "标题").limit(1,5).select()
// query.name('config').where('id', '1').update({})
// let data = new Array(10).fill({name:'一号', age:36})
// query.name('config').insert(data)
// query.name("demo_site")
// 	.where({
// 		id: ['>', 1],
// 		title: [['like', 'JS%'], 'or', ['like', '%JS']],
// 		name: [
// 			['<>', 'JS'],
// 			['<>', 'Node'],
// 		],
// 	}).whereOr('desc', '').alias("a").where('key', 'between', [1,2]).select()
// query.name("demo_site")
// 	.where({
// 		id: ['>', 1],
// 		title: [['like', 'JS%'], 'or', ['like', '%JS']],
// 		name: [
// 			['<>', 'JS'],
// 			['<>', 'Node'],
// 		],
// 	}).whereOr('desc', '').alias("a").join("demo_config c", "a.configID = c.id").join("demo_student d", "d.id = c.id", 'LEFT').limit(1,5).select()
