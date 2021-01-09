import { IObject } from '../typings'
import {
	toKeys,
	toValues,
	isStr,
	isArray,
	typeOf,
	isObj,
	isPrimitive,
	toUpperCase,
	isDate,
} from '../utils'
export default class Builder {
	private sql: string = ''
	protected resultCode: string = ''
	protected expMap: string[] = []
	constructor() {
		console.log('cece')
		;[
			'EQ,=,eq',
			'NEQ,<>,neq',
			'GT,>,gt',
			'LT,<,lt',
			'ELT,<=,elt',
			'EGT,>=,egt',
			'LIKE,like',
			'BETWEEN,between',
			'IN,in',
			'NULL,null',
		].forEach((key) => {
			let split = (key as string).split(',')
			;(split || []).forEach((v) => {
				if (!this.expMap.includes(v)) this.expMap.push(v)
			})
		})
	}
	protected build($options: any) {
		console.log($options)
		const fields = toKeys($options || {})
		let where: IObject = {}
		let table: string = ''
		let field: string = '*'
		let select: boolean | undefined = $options['select']
		let join: string = ''
		let alias: string = ''
		let order: string = ''
		let group: string = ''
		let from: string = ''
		let limit: string = ''
		fields.forEach((v) => {
			if (v === 'where') {
				where = this.buildWhere($options['where'], $options['keyword'])
				// 'SELECT ?? FROM `orm_user` WHERE'
			} else if (v === 'table') {
				table = this.buildTable($options['table'], $options['alias'])
			} else if (v === 'field') {
				field = this.buildField($options['field'])
			} else if (v === 'join') {
				join = this.buildJoin($options['join'], $options['alias'])
			} else if (v === 'from') {
				from = this.buildFrom($options['from'], $options['alias'])
			} else if (v === 'group') {
				group = this.buildGroup($options['group'])
			} else if (v === 'order') {
				order = this.buildOrder($options['group'])
			} else if (v === 'limit') {
				limit = this.buildLimit($options['limit'])
			}
		})
		if (select) {
			let sql: string = `SELECT ${field} FROM ${from} ${join} ${where['sql']} ${order} ${group} ${limit}`
			console.log(sql)
			console.log(where['params'])
		}
		return where
	}
	/**
	 * @description 过滤SQL关键字
	 *
	 * @private
	 * @param {string} str
	 * @param {(string | undefined)} [replace=undefined]
	 * @return {*}  {(boolean | string)}
	 * @memberof BuildSQL
	 */
	private filterSqlSyntax(
		str: string,
		replace: string | undefined = undefined
	): boolean | string {
		const reg: RegExp = /and|exec|execute|insert|select|delete|update|count|drop|chr|mid|master|truncate|char|declare|sitename|net user|xp_cmdshell|or|like|and|exec|execute|insert|create|drop|table|from|grant|use|group_concat|column_name|information_schema.columns|table_schema|union|where|select|delete|update|order|by|count|chr|mid|master|truncate|char|declare/gi
		return replace === undefined || replace === null
			? reg.test(str)
			: str.replace(reg, replace)
	}
	/**
	 * @description 特殊字符过滤
	 *
	 * @private
	 * @param {string} str
	 * @param {string} [replace]
	 * @return {*}  {(boolean | string)}
	 * @memberof BuildSQL
	 */
	private filterChar(str: string, replace?: string): boolean | string {
		const reg: RegExp = /[~'\-`"？《》“”‘’；;！#￥……&*（）\{\}——+：\{\}【】!\[\]<>@#$%^&*()-+=:\s\|]/gi
		return replace === undefined || replace === null
			? reg.test(str)
			: str.replace(reg, replace)
	}
	/**
	 * 解析查询语句
	 */
	private buildWhere(
		whereOption: Array<any> = [],
		query: string[] = []
	): IObject {
		console.log('++', whereOption, query)
		const sqlMap: string[] = ['WHERE']
		const data: any[] = [] //参数化
		whereOption.forEach((item, index) => {
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
					if (operatorLength >= 2 && i === 0) sqlMap.push('(') //多个表达式用()包含
					if (!key.includes('.')) {
						sqlMap.push(`\`${key}\``, operatorOption[i], '?')
					} else {
						sqlMap.push(`${key}`, operatorOption[i], '?')
					}
					data.push(
						conditionOption[i] !== '' ? conditionOption[i] : "''"
					)

					if (i === operatorLength - 1 && operatorLength >= 2)
						sqlMap.push(')')

					if (keywordOption[i]) sqlMap.push(keywordOption[i])
					else if (length >= 2 && i + 1 < operatorLength)
						sqlMap.push('AND') //多个条件
					i++
				}
				len++
			}
			if (query[index]) {
				if (['AND', 'OR'].includes(sqlMap[sqlMap.length - 1])) {
					sqlMap[sqlMap.length - 1] = query[index]
				} else {
					sqlMap.push(query[index])
				}
			}
		})
		if (
			sqlMap.lastIndexOf('AND') === sqlMap.length - 1 ||
			sqlMap.lastIndexOf('OR') === sqlMap.length - 1
		) {
			sqlMap.splice(sqlMap.length - 1, 1)
		}
		return {
			sql: sqlMap.join(' '),
			params: data,
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
	private buildField($fields: string): string {
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
		table.forEach((item) => {
			let name: string = item
			let condition: string = $config[item][0]
			let joinType: string = $config[item][1]
			let filter: string[] = alias.filter((key) =>
				table.includes($alias[key])
			)
			name = `${item} ${filter[0]}`
			join += `${joinType} JOIN ${name} ON ${condition} `
		})
		return join
	}
	/**
	 * 解析From
	 */
	private buildFrom($table: string[], $alias: IObject): string {
		let keys: string[] = toKeys($alias)
		let from: string[] = []
		$table.forEach((table, index) => {
			let value: string[] = keys.filter((key) => $alias[key] === table)
			console.log(value)
			if (value[0]) {
				if (!from.includes(`${table} ${value[0]}`))
					from.push(`${table} ${value[0]}`)
			}
		})
		return from.join(',')
	}

	/**
	 * 解析group by
	 */
	private buildGroup($group: string): string {
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
	private buildOrder($order: string): string {
		let order: string = 'ORDER BY '
		let map: string[] = []
		let split: string[] = $order.split(',')
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
	protected buildInsert($insert: any, $table: string | string[]): string {
		if (isArray($table)) {
			$table = $table[0]
		}
		if (isObj($insert)) $insert = [$insert]

		let insertMap: any[] = []
		;($insert as []).forEach((item) => {
			let keys: string[] = toKeys(item)
			let data: any[] = []
			keys.forEach((key) => {
				if (isStr(item[key]) || isDate(item[key])) {
					data.push(`'${item[key]}'`)
				} else {
					data.push(item[key])
				}
			})
			let insert: string = `INSERT INTO ${$table} (${keys.join(
				','
			)}) VALUES (${data.join(',')})`
			insertMap.push(insert)
		})
		return insertMap.join(';')
	}
}
