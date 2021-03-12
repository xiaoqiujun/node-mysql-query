import { IBuildResult, IObject } from '../typings'
import {
	toKeys,
	toValues,
	isStr,
	isArray,
	typeOf,
	isObj,
	toUpperCase,
	isDate,
	each,
	isRegExp,
	isBool,
	isInt,
	has,
	toLowerCase,
} from '../utils'
import Exception from './Exception'
export default class Builder {
	private sql: string = ''
	protected _resultCode: string = ''
	protected _expMap: string[] = []

	constructor() {
		;[
			'=,eq',
			'>,gt',
			'<,lt',
			'<>,neq',
			'<=,elt',
			'>=,egt',
			'like',
			'between',
			'not between',
			'in',
			'not in',
			'null',
			'not null',
		].forEach((key) => {
			let split = (key as string).split(',')
			;(split || []).forEach((v) => {
				if (!this._expMap.includes(v)) this._expMap.push(v)
			})
		})
	}
	/**
	 * 解析查询
	 */
	protected buildQuery($options: any): IBuildResult {
		let where: IBuildResult = this.buildWhere($options['where'], $options['keyword'], $options['alias'])
		let table: string = this.buildTable($options['table'], $options['alias'])
		let field: string = this.buildField($options['field'])
		let join: string = this.buildJoin($options['join'], $options['alias'])
		let group: string = this.buildGroup($options['group'])
		let order: string = this.buildOrder($options['order'])
		let limit: string = this.buildLimit($options['limit'])
		let distinct: string = $options['distinct'] === true ? 'DISTINCT' : ''
		let comment: string = $options['comment'] || ''
		const sql: string[] = [
			`SELECT`,
			`${distinct}`,
			`${field}`,
			`FROM`,
			`${table}`,
			`${join}`,
			`${where['sql']}`,
			`${order}`,
			`${group}`,
			`${limit}`,
			comment ? `##${comment}` : '',
		].filter((item) => item !== '')
		return {
			sql: sql.join(' '),
			values: where.values,
		}
	}
	/**
	 * 解析查询语句
	 */
	private buildWhere(whereOption: Array<any> = [], query: string[] = [], alias?:IObject): IBuildResult {
		const sqlMap: string[] = ['WHERE']
		const expObj: object = {
			eq: '=',
			neq: '<>',
			gt: '>',
			lt: '<',
			elt: '<=',
			egt: '>=',
		}
		const aliasTable:string[] = toValues(alias || {})
		const data: any[] = [] //参数化
		whereOption.forEach((item, index) => {
			if(!item['table']) throw new Exception("没有选择表")
			let len: number = 0
			let field: string[] = item['field'] //获取字段
			let length: number = field.length
			let fiedlQuery: string[] = item['query']
			let operator: IObject = item['operator'] //获取表达式
			let condition: IObject = item['condition'] //获取条件
			let keyword: IObject = item['keyword'] //获取OR | AND  多个条件查询 id=1 or id=2
			fiedlQuery.forEach((v) => sqlMap.push(v))
			while (len < length) {
				let key: string = field[len]
				let keywordOption: string[] = keyword[key] || []
				let conditionOption: string[] = condition[key] || []
				let operatorOption: string[] = operator[key] || []
				let operatorLength: number = operatorOption.length
				let i: number = 0
				while (i < operatorLength) {
					if (
						!this._expMap.includes(operatorOption[i]) &&
						!this._expMap.includes(toLowerCase(operatorOption[i]))
					)
						throw new Exception(`SQL操作符错误 '${operatorOption[i]}'`)
					if (operatorLength >= 2 && i === 0) sqlMap.push('(') //多个表达式用()包含
					if (has(expObj, operatorOption[i]) && expObj[operatorOption[i]])
						operatorOption[i] = expObj[operatorOption[i]] //转换操作符
					if (!key.includes('.')) {
						let index:number = aliasTable.indexOf(item['table'])
						if(index !== -1) {
							let keys:string[] = toKeys(alias || {})
							keys[index] && sqlMap.push(`${keys[index]}.${key}`, toUpperCase(operatorOption[i]), '?')
						}else {
							sqlMap.push(`\`${key}\``, toUpperCase(operatorOption[i]), '?')
						}
					} else {
						sqlMap.push(`${key}`, toUpperCase(operatorOption[i]), '?')
					}
					if (/IN|NOT IN/.test(toUpperCase(operatorOption[i]))) {
						if (sqlMap[sqlMap.length - 1] === '?') sqlMap[sqlMap.length - 1] = '(?)'
						if (isArray(conditionOption)) data.push(conditionOption)
					} else if (/BETWEEN|NOT BETWEEN/.test(toUpperCase(operatorOption[i]))) {
						if (!isArray(conditionOption))
							throw new Exception(`${toUpperCase(operatorOption[i])} 查询条件是数组类型`)
						if (isArray(conditionOption) && conditionOption.length !== 2)
							throw new Exception(`${toUpperCase(operatorOption[i])} 数组长度只能是2个长度`)
						each(conditionOption, (v, key) => {
							data.push([v])
						})
						if (sqlMap[sqlMap.length - 1] === '?') sqlMap[sqlMap.length - 1] = `? AND ?`
					} else if (/NULL|NOT NULL/.test(toUpperCase(String(conditionOption[i])))) {
						sqlMap[sqlMap.length - 1] = toUpperCase(conditionOption[i])
						sqlMap[sqlMap.length - 2] = 'IS'
					} else {
						data.push(conditionOption[i] !== '' ? conditionOption[i] : '')
					}

					if (i === operatorLength - 1 && operatorLength >= 2) sqlMap.push(')')

					if (keywordOption[i]) sqlMap.push(keywordOption[i])
					else if (length >= 2 && i + 1 < operatorLength) sqlMap.push('AND') //一个字段多个条件
					i++
				}
				len++
				if (len < length) sqlMap.push('AND') //多个字段
			}
			if (query[index]) {
				if (['AND', 'OR'].includes(sqlMap[sqlMap.length - 1])) {
					sqlMap[sqlMap.length - 1] = query[index]
				} else {
					sqlMap.push(query[index])
				}
			}
		})
		if (sqlMap.lastIndexOf('AND') === sqlMap.length - 1 || sqlMap.lastIndexOf('OR') === sqlMap.length - 1) {
			sqlMap.splice(sqlMap.length - 1, 1)
		}
		return {
			sql: sqlMap.length === 1 ? '' : sqlMap.join(' '),
			values: data,
		}
	}
	/**
	 * @description 解析数据表
	 * @param $table 数据表
	 * @param $alias 数据表别名
	 */
	private buildTable($table: string[], $alias: IObject): string {
		const alias: string[] = toKeys($alias)
		if ($table.length) {
			alias.forEach((item) => {
				let name: string = $alias[item]
				let index: number = $table.indexOf(name)
				if (index > -1) {
					$table[index] = `${$table[index]} ${item}`
				}
			})
			return $table.join(',')
		}
		return 'NOT TABLE'
	}

	/**
	 * @description 解析字段
	 */
	private buildField($fields: string = ''): string {
		if ($fields === undefined || $fields === '') {
			return '*'
		}
		return $fields
	}

	/**
	 * 关联查询
	 */
	private buildJoin($config: IObject, $alias: IObject): string {
		let join: string = ''
		let table: string[] = toKeys($config)
		let alias: string[] = toKeys($alias)
		each(table, (item) => {
			let name: string = item
			let condition: string = $config[item][0]
			let joinType: string = $config[item][1]
			let filter: string[] = alias.filter((key) => table.includes($alias[key]))
			each(filter, (v) => {
				if ($alias[v] === item) {
					name = `${item} ${v}`
				}
			})
			// name = `${item} ${filter[0]}`
			join += `${joinType} JOIN ${name} ON ${condition}`
		})
		return join
	}

	/**
	 * 解析group by
	 */
	private buildGroup($group: string = ''): string {
		let group: string = 'GROUP BY '
		let map: string[] = []
		let split: string[] = $group.split(',')
		split.forEach((item: string) => {
			let key: string[] = item.split('.')
			let name: string = ''
			if (key.length === 2) {
				name = `\`${key[0]}\`.\`${key[1]}\``
			} else {
				name = `\`${key[0]}\``
			}
			if (!map.includes(name)) map.push(name)
		})
		group += `${map.join(',')}`
		return !$group ? '' : group
	}
	/**
	 * 解析order by
	 */
	private buildOrder($order: IObject): string {
		let order: string = 'ORDER BY '
		let map: string[] = []
		let keys: string[] = toKeys($order)
		keys.forEach((item: string) => {
			let key: string[] = item.split('.')
			let name: string = ''
			if (key.length === 2) {
				name = `\`${key[0]}\`.\`${key[1]}\``
			} else {
				name = `\`${key[0]}\``
			}
			if (!map.includes(name)) map.push(`${name} ${$order[item]}`)
		})
		order += `${map.join(',')}`
		return !$order ? '' : order
	}

	/**
	 * 解析limit
	 */
	private buildLimit($limit): string {
		let limit: string = 'LIMIT '
		limit += `${$limit}`
		return !$limit ? '' : limit
	}
	/**
	 * 解析插入数据
	 */
	protected buildInsert($options: IObject, $table: string | string[]): IBuildResult {
		if (isArray($table)) {
			$table = $table[0]
		}
		let $insert: any = $options['insert']
		let $comment: any = $options['comment']
		if (!isArray($insert)) $insert = [$insert]
		let fields: string[] = toKeys($insert[0])
		const dataMap: any[] = []
		;($insert as []).forEach((item) => {
			let keys: string[] = toKeys(item)
			let data: any[] = []
			keys.forEach((key) => {
				data.push(item[key])
			})
			dataMap.push(data)
		})
		let insert: string = `INSERT INTO ${$table} (${fields.join(',')}) VALUES ?${$comment ? ` ##${$comment}` : ''}`
		return {
			sql: insert,
			values: [dataMap],
		}
	}

	/**
	 * 解析更新数据
	 */
	protected buildUpdate($options: any, $table: string | string[]): IBuildResult {
		const update: IObject = $options['update']
		const where: IBuildResult = this.buildWhere($options['where'], $options['keyword'])
		if (!where['sql']) return { sql: '', values: [] }
		const keys: string[] = toKeys(update)
		if (isArray($table)) {
			$table = $table[0]
		}
		let sql: string[] = ['UPDATE', $table as string, 'SET']
		let data: any[] = []
		let field: string[] = []
		each(keys, (key) => {
			field.push(`${key} = ?`)
			data.push(update[key])
		})
		sql = sql.concat(field.join(','), where['sql'])
		data = data.concat(where.values)
		return {
			sql: sql.join(' '),
			values: data,
		}
	}
	/**
	 * 解析删除
	 */
	protected buildDelete($options: any, $table: string | string[]): IBuildResult {
		const where: IBuildResult = this.buildWhere($options['where'], $options['keyword'])
		if (!where['sql']) return { sql: '', values: [] }
		if (isArray($table)) {
			$table = $table[0]
		}
		let sql: string[] = ['DELETE', 'FROM', $table as string]

		sql.push(where['sql'])
		return {
			sql: sql.join(' '),
			values: where.values,
		}
	}
}
