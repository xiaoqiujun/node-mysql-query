const ExceptionKey: string = '@xqj/mysql'
export default class Exception {
	protected $message: string = ''
	constructor(msg: string) {
		this.$message = `[${ExceptionKey}]:${msg}`
	}
}
