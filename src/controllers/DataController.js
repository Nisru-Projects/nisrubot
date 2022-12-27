module.exports = class DataController {
	constructor(knexDatabase, redisCache) {
		this.knexDatabase = knexDatabase
		this.redisCache = redisCache
	}

	getPrimaryKey(key) {
		return this.knexDatabase.keys.find(keyobj => keyobj.key === key).primaryKey
	}

	updateCache(primaryValue, key) {
		const primaryKey = this.getPrimaryKey(key)

		console.log('primary key of updateCache', primaryKey)

		const value = this.knexDatabase.select(key.split('.')[1]).from(key.split('.')[0]).where(primaryValue).first()

		console.log('value of updateCache', primaryKey)

		return this.redisCache.set(key, value)
	}

	query(query, params) {
		return this.knexDatabase.query(query, params)
	}


	get(keys) {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (resolve) => {
			const result = {}
			for (const key of keys) {
				if (!this.validKey(key)) return console.log(`[DATABASE] Invalid key ${key}`.red)
				const value = await this.redisCache.get(key)
				if (value) {
					result[key] = value
				}
				else {
					result[key] = await this.updateCache(key)
				}
			}
			resolve(result)
		})
	}

	set(primaryValue, key, value) {
		return
	}

	delete(primaryValue, key) {
		return
	}

	validKey(key) {
		return this.knexDatabase.keys.includes(key)
	}

	exists(primaryValue, key) {
	}

	async test() {
		const res = await this.get('characters_geral.*')
		return res
	}

}