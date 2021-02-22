import Query from '../src/core/Query'
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
Query.debug = true
let query = new Query(config)
describe('where查询 => table:teacher,condition:id = 1', () => {
	it('用例1:', () => {
		let data:object = {
			sql: 'SELECT * FROM `sc_teacher` WHERE `id` = ?',
			values:[1]
		} 
		const callback = (query) => {
			console.log(query)
			expect(query).toEqual(data)
		}
		query.name('teacher').where('id',1).select(callback)
	})
})
