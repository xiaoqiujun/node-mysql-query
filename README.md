# node-mysql-query

node-mysql 的常用操作封装，与 ThinkPHP 的查询器类似
功能还在优化


- [Install](#install)
- [Introduction](#introduction)
- [Jest](#jest)



## Install

```sh
npm install --save @xqj/mysql
```


## Introduction


### 配置(CONFIG)
参数 | 说明 | 类型 | 默认值
-|--|--|--
host | 数据库的主机名 | `string`| 必填项
port| 要连接的端口号 | `string` | 3306
user| MySQL用户 | `string` | 必填项
password| MySQL用户的密码 | `string` | 必填项
database| 数据库名称 | `string` | 必填项
prefix| 数据库的前缀 | `string` | 可选

其他配置 [mysqljs/mysql](https://github.com/mysqljs/mysql#connection-options)

### 创建连接
```js
const {default:Db} = require('@xqj/mysql')	//or import Db from '@xqj/mysql'
const db = Db.connect({
	host: 'localhost',
	password: 'root',
	user: 'root',
	database: 'demo',
	prefix: 't_'
})
```

### 基本的查询
```js
const {default:Db} = require('@xqj/mysql')	//or import Db from '@xqj/mysql'
const db = Db.connect({
	host: 'localhost',
	password: 'root',
	user: 'root',
	database: 'school',
	prefix: 'sc_'
})
db.name('teacher').where('username', '').select().then(res => {
	//return [rows]
})
```

### Promise化
- #### select
	```js
	//select
	db.name('teacher').where('username', '').select().then(res => {})

	async function find() {
		let res = await db.name('teacher').where('username','').find()
	}
	```
- #### update
	```js
	db.name('teacher').where('username', '').update({
		username:'张三'
	}).then(res => {
		console.log(res) //return affected rows
	})
	```

- #### delete
	```js
	db.name('teacher').where('username', '').delete().then(res => {
		console.log(res) //return affected rows
	})
	```
- #### insert
	```js
	db
	.name('teacher')
	.insert([{
		username: '李四',
		create_time: new Date(),
	}])
	.then((res) => {
		console.log(res)	//return { affectedRows, insertId }
	})
	```
- #### insertGetId
	```js
	db
	.name('teacher')
	.insertGetId([{
		username: '李四',
		create_time: new Date(),
	}])
	.then((res) => {
		console.log(res)	//return insert Id
	})
	```
- #### query
	```js
	db.query("SELECT * FROM `sc_teacher` WHERE `username` = ''").then(res => {
		//return { affectedRows, insertId }
	})
	//PrepareStatement机制
	db.exec("SELECT * FROM `sc_teacher` WHERE `username` = ?", ['']).then(res => {
		//return { affectedRows, insertId }
	})
	```
### Debug
```js
const {default:Db} = require('@xqj/mysql')	//or import Db from '@xqj/mysql'
Db.debug = true
const db = Db.connect({
	host: 'localhost',
	password: 'root',
	user: 'root',
	database: 'school',
	prefix: 'sc_'
})
db.name('teacher').where('username', '').select(function(query, db) {
	console.log(query)	//return object
	// {
	// 	sql:SELECT * FROM `sc_teacher` WHERE `username` = ?
	// 	values:['']
	// }
	console.log(db)	//return db instance
}).then(res => {
	//return undefined
})
```

### Methods

 - #### name (names: string | string[] )
 	```js
	db.name('teacher').where('username', '').select()

	//SELECT * FROM `sc_teacher` WHERE `username` = ''
 	```
- #### table (names:string | string[] )
	```js
	db.table('sc_teacher').where('username', '').select()

	//SELECT * FROM `sc_teacher` WHERE `username` = ''
	```
	
- #### alias (names:string | object )
	```js
	db.table('sc_teacher').alias('a').where('username', '').select()
	//SELECT * FROM `sc_teacher` WHERE `username` = ''
	db.table(['sc_teacher', 'sc_student']).alias({
		'sc_teacher':'a',
		'sc_student':'b'
	}).where('username', '').select()
	```
- #### field (fields:string )
	```js
	db.table('sc_teacher').field('id,username,create_time').where('username', '').select()

	//SELECT id,username,create_time FROM `sc_teacher` WHERE `username` = ''
	```              
- #### limit (star:string|number,  end?:number)
	```js
	db.table('sc_teacher').where('username', '').limit('1,5').select()
	db.table('sc_teacher').where('username', '').limit(1,5).select()
	//SELECT * FROM `sc_teacher` WHERE `username` = '' LIMIT 1,5
	``` 
- #### group (fields:string)
	```js
	db.table('sc_teacher').where('username', '').group('id').select()
	//SELECT * FROM `sc_teacher` WHERE `username` = '' GROUP BY id
	``` 
- #### distinct (isDistinct: boolean)
	```js
	db.table('sc_teacher').field('username').distinct(true).select()
	//SELECT DISTINCT username FROM `sc_teacher`
	``` 
- #### join (table: string, condition: string, joinType:sqlJoinType = 'INNER')
	```js
	type sqlJoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
	db.table('sc_teacher').alias('a').join("sc_student b", "a.username = b.teacher_name").select()
	//SELECT * FROM sc_teacher a INNER JOIN sc_student b ON a.username = b.teacher_name

	db.table('sc_teacher').alias('a').where('username', '').join("sc_student b", "a.username = b.teacher_name").select()
	//SELECT * FROM sc_teacher a INNER JOIN sc_student b ON a.username = b.teacher_name WHERE a.username = ''
	```
- #### order (field: string)
	```js
	db.table('sc_teacher').where('username', '').order('id DESC').select()
	//SELECT * FROM sc_teacher a WHERE a.username = '' ORDER BY `id` DESC

	db.table('sc_teacher').where('username', '').order('id DESC, username ASC').select()
	//SELECT * FROM sc_teacher a WHERE a.username = '' ORDER BY `id` DESC, `username` ASC
	```
- #### comment (desc: string)
	```js
	db.table('sc_teacher').comment("Query sc_teacher").where('username', '').select()
	//SELECT * FROM sc_teacher a WHERE a.username = ''  ##Query sc_teacher
	```
- #### format (sql:string, values:any[])
	```js
	db.format('SELECT * FROM sc_teacher a WHERE a.username = ?', [''])
	//SELECT * FROM sc_teacher a WHERE a.username = ''
	```
- #### config (key:string)
	```js
	db.config('prefix')
	//return 'sc_'
	```



## Jest

```sh
npm run test
```
- ### 例子
	```js
	const config = {
		host: '127.0.0.1',
		database: 'ormtype',
		user: 'root',
		password: 'root',
		prefix: 'sc_'
	}
	Db.debug = true
	let db = Db.connect(config)
	describe('where查询 => table:teacher,condition:id = 1', () => {
		it('用例1:', () => {
			let data = {
				sql: 'SELECT * FROM `sc_teacher` WHERE `id` = ?',
				values:[1]
			} 
			const callback = (query) => {
				expect(query).toEqual(data)
			}
			db.name('teacher').where('id',1).select(callback)
		})
	})
	```