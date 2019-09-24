export default class LoginError extends Error {
	err: any
	constructor(err: any) {
		super('Login Error!')
		this.err = err
	}
}
