import { IDataBase, IObject, sqlJoinType } from '../typings';
import Builder from './Builder';
export default class Query extends Builder {
    private static $connection;
    private _table;
    private _name;
    private _prefix;
    private _options;
    constructor(config: IDataBase);
    /**
     *
     * @param names 数据表名称  不含前缀   ("table1") (["table1 a", "table2 b"])
     */
    name(names: string | Array<string>): Query;
    /**
     *
     * @param names 数据表名称 含前缀
     */
    table(names: string | Array<string>): Query;
    /**
     * @param logic 查询逻辑 AND | OR
     * @param field 查询的字段			'id'  id  {id:['=', 1]}
     * @param operator 查询的表达式	1	<>
     * @param condition 查询的条件	 ''   1 选填
     */
    private parseWhere;
    whereOr(field: string | IObject, operator?: string | number | undefined, condition?: string | string[] | number | number[] | undefined): Query;
    where(field: string | IObject, operator?: string | number | undefined, condition?: string | string[] | number | number[] | undefined): Query;
    /**
     *
     * @param fields 操作的字段
     * @returns 返回要操作的字段
     * 'id, name, description as desc'
     */
    field(fields: string): Query;
    /**
     * 查询和操作的数量
     * @param star 开始
     * @param end 结尾
     */
    limit(star: string | number, end?: number | undefined): Query;
    /**
     *
     * @param fields 操作的字段 id,title
     */
    group(fields: string): Query;
    /**
     *
     * @param name 设置数据表别名 可以多个数据表
     */
    alias(names: string | IObject): Query;
    /**
     *
     * @description DISTINCT 方法用于返回唯一不同的值
     * @param {boolean} isDistinct
     * @return {*}  {Query}
     * @memberof Query
     */
    distinct(isDistinct: boolean): Query;
    /**
     *
     * @param table 选择的表
     * @param condition 表达式
     * @param joinType 关联类型
     */
    join(table: string, condition: string, joinType?: sqlJoinType): Query;
    /**
     *
     * @param orders 对操作的字段结果排序
     */
    order(field: string): Query;
    /**
     * @returns 返回只有一条结果的查询
     */
    find(): any;
    /**
     * @returns 返回多条结果的查询
     */
    select(): any[];
    /**
     *
     * @param desc SQL语句中添加注释内容
     */
    comment(desc: string): Query;
    /**
     *
     * @param field IObject 传一个对象
     * {
     *    'name':"张三",
     *    'age': 25,
     *    'status':0
     * }
     */
    update(field: IObject): void;
    delete(): void;
    insert(data: IObject | IObject[]): never[];
    insertGetId(): void;
}
