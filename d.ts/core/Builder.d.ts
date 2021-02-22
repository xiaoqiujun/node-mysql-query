import { IBuildResult, IObject } from '../typings';
export default class Builder {
    private sql;
    protected _resultCode: string;
    protected _expMap: string[];
    constructor();
    /**
     * 解析查询
     */
    protected buildQuery($options: any): IBuildResult;
    /**
     * 解析查询语句
     */
    private buildWhere;
    /**
     * @description 解析数据表
     * @param $table 数据表
     * @param $alias 数据表别名
     */
    private buildTable;
    /**
     * @description 解析字段
     */
    private buildField;
    /**
     * 关联查询
     */
    private buildJoin;
    /**
     * 解析group by
     */
    private buildGroup;
    /**
     * 解析order by
     */
    private buildOrder;
    /**
     * 解析limit
     */
    private buildLimit;
    /**
     * 解析插入数据
     */
    protected buildInsert($options: IObject, $table: string | string[]): IBuildResult;
    /**
     * 解析更新数据
     */
    protected buildUpdate($options: any, $table: string | string[]): IBuildResult;
    /**
     * 解析删除
     */
    protected buildDelete($options: any, $table: string | string[]): IBuildResult;
}
