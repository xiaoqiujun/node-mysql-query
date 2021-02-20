const ExceptionKey: string = '@xqj/mysql'
export default class Exception {
	protected _message: string = ''
	constructor(msg: string) {
		this._message = `[${ExceptionKey}]:${msg}`
	}
}
