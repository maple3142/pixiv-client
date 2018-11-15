const excluded = new Set([
	'constructor',
	'prototype',
	'arguments',
	'caller',
	'name',
	'bind',
	'call',
	'apply',
	'toString',
	'length'
])
exports.mixin = (base,...klasses) => {
	for (const klass of klasses) {
		const props = Object.getOwnPropertyNames(klass.prototype)
			.concat(Object.getOwnPropertySymbols(klass.prototype))
			.filter(prop => !excluded.has(prop))
		for (const prop of props) {
			base.prototype[prop] = klass.prototype[prop]
		}
	}
	return base
}
