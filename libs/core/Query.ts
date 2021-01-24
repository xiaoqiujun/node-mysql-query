import {
	IDataBase,
	ISql,
	IObject,
	IWhereSyntaxTree,
	sqlJoinTypeEnum,
	sqlJoinType,
	sqlOrderEnum,
	sqlOrderType,
	logicType,
	IBuildResult,
} from '../typings'
import mysql, { Connection, QueryError, Pool } from 'mysql2'
import { isStr, isArray, typeOf, isObj, toKeys, isPrimitive, toUpperCase } from '../utils'
import Db from './Db'
import Builder from './Builder'
export default class Query extends Builder {
	// // 数据库Connection对象实例
	private static $connection: Db
	// 当前数据表名称（含前缀）
	private _table: string | Array<string> = ''
	// 当前数据表名称（不含前缀）
	private _name: string | Array<string> = ''
	// 当前数据表前缀
	private _prefix: string = ''
	// 查询参数
	private _options: any = {}
	constructor(config: IDataBase) {
		super()
		this._prefix = config.prefix || ''
		Query.$connection = Db.connect(config)
	}
	/**
	 *
	 * @param names 数据表名称  不含前缀   ("table1") (["table1 a", "table2 b"])
	 */
	public name(names: string | Array<string>): Query {
		this._options = {} //重置
		let table: string[] = this._options['table'] || []
		let alias: IObject = this._options['alias'] || {}
		this._name = names
		if (isStr(names)) {
			let _name: string = `${this._prefix}${names}`
			let split: string[] = (names as string).split(' ')
			if (split.length === 2) {
				_name = `${this._prefix}${split[0]}`
			}
			this._table = _name
			if (!table.includes(_name)) {
				table.push(_name)
			}
		} else if (isArray(names)) {
			;(names as []).forEach((item) => {
				//['table1 a', 'table2 b'] ['table1', 'table2']
				let _name: string = `${this._prefix}${item}`
				let split: string[] = (item as string).split(' ')
				if (split.length === 2) {
					_name = `${this._prefix}${split[0]}`
					if (this._prefix && split[0].split(this._prefix).length !== 2) {
						//没有表前缀
						alias[split[1]] = this._prefix + split[0]
					}
				}
				if (!table.includes(_name)) {
					table.push(_name)
				}
			})
		}
		this._options['table'] = table
		this._options['alias'] = alias
		return this
	}
	/**
	 *
	 * @param names 数据表名称 含前缀
	 */
	public table(names: string | Array<string>): Query {
		this._options = {}
		let table: string[] = this._options['table'] || []
		let alias: IObject = this._options['alias'] || {}
		this._table = names
		if (isStr(names)) {
			let split: string[] = (names as string).split(' ')
			let _name: string = names as string
			if (split.length === 2) {
				_name = split[0]
				alias[split[1]] = _name
			}
			if (!table.includes(_name)) {
				table.push(_name)
			}
		} else if (isArray(names)) {
			//数组的情况   ["table1 a", "table b", "table c"]
			;(names as []).forEach((item) => {
				let _name: string = item
				let split: string[] = (item as string).split(' ')
				if (split.length === 2) {
					_name = split[0]
					alias[split[1]] = split[0]
				}
				if (!table.includes(_name)) {
					table.push(_name)
				}
			})
		}
		this._options['table'] = table
		this._options['alias'] = alias
		return this
	}
	/**
	 * @param logic 查询逻辑 AND | OR
	 * @param field 查询的字段			'id'  id  {id:['=', 1]}
	 * @param operator 查询的表达式	1	<>
	 * @param condition 查询的条件	 ''   1 选填
	 */
	private parseWhere(
		logic: logicType,
		field: string | IObject,
		operator: string | number | undefined,
		condition?: string | string[] | number | number[] | undefined
	) {
		logic = logic || 'AND'
		const param: IWhereSyntaxTree = {
			field: [],
			operator: {},
			condition: {},
			keyword: {},
			query: [],
		}
		if (typeOf(field, 'string')) {
			//字符串形式  where("id","<>", 1) where("id",1) where("table.id = table.id")
			if (operator === undefined && condition === undefined) {
				const query: string[] = param.query || []
				if (query.length) {
					query.push(logic, field as string)
				} else {
					query.push(field as string)
				}
				param.query = query
			} else {
				param.field.push(field as string) //把字段保存起来
				param.operator[field as string] = (param.operator[field as string] || []).concat(
					condition === undefined ? '=' : operator
				)
				param.condition[field as string] = (param.condition[field as string] || []).concat(
					condition === undefined ? operator : condition
				)
			}
		} else if (isObj(field)) {
			//复杂形式 where({id:['>', 1]})
			// where({
			//     'name.id': ['<', 'config.id'],
			//     'name.key': 'config.key',
			// })
			// where({
			//     'name.id': [
			//         ['>', 'config.id'],
			//         ['=', 'config.key'],
			//     ],
			//     'name.key': [['>', 'config.id'], 'or', ['=', 'config.key']],
			// })
			const key: string[] = toKeys(field) //获取查询的所有字段
			key.forEach((key) => {
				let value: any = field[key]
				if (key.indexOf('.') < 0) param.field.push(key)
				if (isStr(value)) value = [value] //如果是字符串 就把字符串转化成[]
				if (isArray(value) && (value as any[]).length) {
					//值为数组
					switch ((value as any[]).length) {
						case 1: //如果长度为1的数组 ['标题']
							param.operator[key] = ((param.operator[key] as []) || []).concat('=' as any) //表达式默认 =
							param.condition[key] = ((param.condition[key] as []) || []).concat(value[0])
							break
						case 2: //长度为2的情况有两种
							if (isArray(value[0]) && isArray(value[1])) {
								//二维数组情况下 即是多个查询条件 [['like', 'JS%'], ['like', '%JS']]
								;(value as []).forEach((v) => {
									let _oper: string = v[0]
									_oper = toUpperCase(_oper)
									param.operator[key] = (param.operator[key] || []).concat(_oper)
									param.condition[key] = (param.condition[key] || []).concat(v[1])
								})
								param.keyword[key] = ((param.keyword[key] as []) || []).concat('AND' as any) //追加一个 AND 语句  因为有多个查询条件
							} else if (isPrimitive(value[0]) && isPrimitive(value[1])) {
								//如果两个不是数组      ['>', 1]
								let _oper: string = value[0]
								_oper = toUpperCase(_oper)
								param.operator[key] = (param.operator[key] || []).concat(_oper)
								param.condition[key] = (param.condition[key] || []).concat(value[1])
							}
							break
						case 3: //长度为3的情况下 [['like', 'JS%'], 'and', ['like', '%JS']]
							if (isArray(value[0]) && isArray(value[2]) && isStr(value[1])) {
								//中间一个是and或者or运算
								;(value as []).forEach((v) => {
									if (!isStr(v)) {
										let _oper: string = v[0]
										_oper = toUpperCase(_oper)
										param.operator[key] = (param.operator[key] || []).concat(_oper)
										param.condition[key] = (param.condition[key] || []).concat(v[1])
									} else {
										param.keyword[key] = ((param.keyword[key] as []) || []).concat(
											toUpperCase(v) as any
										) //追加
									}
								})
							}
						default:
							break
					}
				}
			})
		}
		let whereOption: Array<IWhereSyntaxTree> = this._options['where'] || []
		if (whereOption.length) {
			this._options['keyword'] = ((this._options['keyword'] as []) || []).concat(logic as any)
		}
		whereOption.push(param)
		this._options['where'] = whereOption
	}
	public whereOr(
		field: string | IObject,
		operator?: string | number | undefined,
		condition?: string | string[] | number | number[] | undefined
	): Query {
		this.parseWhere('OR', field, operator, condition)
		return this
	}
	public where(
		field: string | IObject,
		operator?: string | number | undefined,
		condition?: string | string[] | number | number[] | undefined
	): Query {
		this.parseWhere('AND', field, operator, condition)
		return this
	}
	/**
	 *
	 * @param fields 操作的字段
	 * @returns 返回要操作的字段
	 * 'id, name, description as desc'
	 */
	public field(fields: string): Query {
		this._options['field'] = fields
		return this
	}
	/**
	 * 查询和操作的数量
	 * @param star 开始
	 * @param end 结尾
	 */
	public limit(star: string | number, end: number | undefined = undefined): Query {
		let split: any[] = ('' + star).split(',')
		let param: any
		if (end === undefined) {
			param = split.length === 1 ? +split[0] : star
		} else {
			param = `${star},${end}`
		}
		this._options['limit'] = param
		return this
	}
	/**
	 *
	 * @param fields 操作的字段 id,title
	 */
	public group(fields: string): Query {
		this._options['group'] = fields
		return this
	}
	/**
	 *
	 * @param name 设置数据表别名 可以多个数据表
	 */
	public alias(names: string | IObject): Query {
		let alias: IObject = this._options['alias'] || {}
		if (isStr(names) && isStr(this._table) && isStr(this._name)) {
			//选择一个表的时候
			let table = (this._table ? this._table : this._prefix + this._name) || 'NOT TABLE'
			alias[names as string] = table
		} else if (isObj(names)) {
			alias = names as IObject
			const keys: string[] = toKeys(names)
			keys.forEach((k) => {
				if (this._prefix && k.split(this._prefix).length !== 2) {
					//没有表前缀
					alias[names[k]] = this._prefix + k
				} else {
					alias[names[k]] = k
				}
			})
		}
		this._options['alias'] = alias
		return this
	}
	/**
	 *
	 * @description DISTINCT 方法用于返回唯一不同的值
	 * @param {boolean} isDistinct
	 * @return {*}  {Query}
	 * @memberof Query
	 */
	public distinct(isDistinct: boolean): Query {
		this._options['distinct'] = isDistinct
		return this
	}
	/**
	 *
	 * @param table 选择的表
	 * @param condition 表达式
	 * @param joinType 关联类型
	 */
	public join(table: string, condition: string, joinType: sqlJoinType = 'INNER'): Query {
		let split: string[] = table.split(' ')
		let prefix: string[] = split[0].split(this._prefix)
		let alias: IObject = this._options['alias'] || {}
		let join: any = this._options['join'] || {}
		let name: string = ''
		if (prefix.length === 1) {
			//没有表前缀
			name = `${this._prefix}${split[0]}` //加上前缀
		}
		if (split[1]) {
			//有别名才分配	之前别名配置会被后续调用的覆盖
			alias[split[1]] = name
		}
		join[name] = [condition, joinType]
		this._options['alias'] = alias
		this._options['join'] = join
		return this
	}
	/**
	 *
	 * @param orders 对操作的字段结果排序
	 */
	public order(field: string): Query {
		let fields: string[] = field.split(',')
		let order: IObject = this._options['order'] || {}
		fields.forEach((v) => {
			let key: string[] = v.split(' ')
			order[key[0]] = key[1] || sqlOrderEnum.ASC
		})
		this._options['order'] = order
		return this
	}
	/**
	 * @returns 返回只有一条结果的查询
	 */
	public find(): any {
		this._options['select'] = true
		this._options['limit'] = 1
		let res: IBuildResult = this.buildQuery(this._options)
		this._options = {}
		return []
	}
	/**
	 * @returns 返回多条结果的查询
	 */
	public select(): any[] {
		// delete this.$options["limit"];
		// console.log(JSON.stringify(this.$options, null, 2))
		this._options['select'] = true
		let res: IBuildResult = this.buildQuery(this._options)
		this._options = {}
		return []
	}
	/**
	 *
	 * @param desc SQL语句中添加注释内容
	 */
	public comment(desc: string): Query {
		this._options['comment'] = desc
		return this
	}
	/**
	 *
	 * @param field IObject 传一个对象
	 * {
	 *    'name':"张三",
	 *    'age': 25,
	 *    'status':0
	 * }
	 */
	public update(field: IObject) {
		this._options['update'] = field
		let res: IBuildResult = this.buildUpdate(this._options, this._table)
		this._options = {}
	}
	public delete() {
		this._options['delete'] = true
		let res: IBuildResult = this.buildDelete(this._options, this._table)
		this._options = {}
	}
	public insert(data: IObject | IObject[]) {
		this._options['insert'] = data
		let res: IObject = this.buildInsert(this._options['insert'], this._table)
		this._options = {}
		return []
	}
	public insertGetId() {}
}
