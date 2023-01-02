module.exports = class DataManager {
	constructor(knexDatabase, redisCache) {
		this.knexDatabase = knexDatabase
		this.redisCache = redisCache
	}

	getPrimaryKey(key) {
		if (!key.includes('.')) key = `${key}.*`
		const primaryKey = this.knexDatabase.keys.find(keyobj => keyobj.key === key)?.primaryKey
		if (!primaryKey) return console.log(`[DATABASE] Invalid key: ${key}`.red)
		return primaryKey
	}

	updateCache(primaryValue, key, value) {

		if (value) {
			return this.redisCache.set(`${key}:${primaryValue}`, JSON.stringify(value), 60 * 60 * 5)
		}

		return new Promise(async (resolve) => {
			const primaryKey = this.getPrimaryKey(key)
			const query = `SELECT ${key.split('.')[1]} FROM ${key.split('.')[0]} WHERE ${primaryKey} = ?`
			const result = await this.query(query, [primaryValue])
			if (result.rows.length > 0) {
				this.redisCache.set(`${key}:${primaryValue}`, JSON.stringify(result.rows[0]), 60 * 60 * 5)
				resolve(result.rows[0])
			}
			else {
				resolve(null)
			}
		})
	}

	hasCache(primaryValue, key) {
		return new Promise(async (resolve) => {
			const cached = await this.redisCache.get(`${key}:${primaryValue}`)
			resolve(cached != null)
		})
	}

	getFromCache(primaryValue, key) {
		return new Promise(async (resolve) => {
			const cached = await this.redisCache.get(`${key}:${primaryValue}`)
			if (cached) {
				resolve(JSON.parse(cached))
			}
			else {
				resolve(null)
			}
		})
	}

	query(query, params) {
		return new Promise(async (resolve) => {
			const result = await this.knexDatabase.raw(query, params)
			resolve(result)
		})
	}

	get(primaryValue, keys, forcecache = false) {

		if (typeof keys === 'string') keys = [keys]

		keys = keys.map(key => {
			if (!key.includes('.')) return `${key}.*`
			else return key
		})

		for (const key of keys) {
			if (!this.validKey(key)) return console.log(`[DATABASE] Invalid key: ${key}`.red)
		}

		return new Promise(async (resolve) => {
			const result = {}
			for (const key of keys) {
				const cached = await this.hasCache(primaryValue, key)
				if (forcecache || !cached) {
					result[key] = await this.updateCache(primaryValue, key)
				}
				else {
					result[key] = await this.getFromCache(primaryValue, key)
				}
			}

			for (const key of keys) {
				if (!key.endsWith('.*')) {
					result[key] = result[key][key.split('.')[1]]
				}
			}

			resolve(result)
		})
	}

	insert(key, value) {
		return new Promise(async (resolve) => {
			const query = `INSERT INTO ${key.split('.')[0]} (${key.split('.')[1]}) VALUES (?)`
			const result = await this.query(query, [value])
			resolve(result)
		})
	}

	set(primaryValues, values) {

		if (typeof values === 'string') values = [values]

		const keys = Object.keys(values).map(key => {
			if (!key.includes('.')) return `${key}.*`
			else return key
		})

		for (const key of keys) {
			if (!this.validKey(key)) return console.log(`[DATABASE] Invalid key: ${key}`.red)
		}

		const tables = keys.map(key => key.split('.')[0])
		const uniqueTables = [...new Set(tables)]

		return new Promise(async (resolve) => {
			for (const table of uniqueTables) {
				const primaryKey = this.getPrimaryKey(table)
				const query = `UPDATE ${table} SET ${keys.filter(key => key.split('.')[0] === table).map(key => `${key.split('.')[1]} = ?`).join(', ')} WHERE ${primaryKey} = ?`
				const params = keys.filter(key => key.split('.')[0] === table).map(key => values[key])
				params.push(primaryValues[table])
				await this.query(query, params)
				await this.redisCache.delete(`${table}:${primaryValues[table]}`)
			}
			resolve()
		})
	}

	delete(primaryValue, key) {
		return new Promise(async (resolve) => {
			const primaryKey = this.getPrimaryKey(key)
			const query = `DELETE FROM ${key.split('.')[0]} WHERE ${primaryKey} = ?`
			await this.query(query, [primaryValue])
			await this.redisCache.delete(`${key}:${primaryValue}`)
			resolve()
		})
	}

	exists(primaryValue, key) {
		return new Promise(async (resolve) => {
			const primaryKey = this.getPrimaryKey(key)
			const query = `SELECT * FROM ${key.split('.')[0]} WHERE ${primaryKey} = ?`
			const result = await this.query(query, [primaryValue])
			resolve(result.rows.length > 0)
		})
	}

	validKey(key) {
		return this.knexDatabase.keys.find(keyobj => keyobj.key === key)
	}

	async benchmark(id) {
		const start = Date.now()
		const res1 = await this.get(id, 'users.*', true)
		const end = Date.now()
		console.log(`[DATABASE] Tempo de resposta sem o cache: ${end - start}ms`)

		const start2 = Date.now()
		const res2 = await this.get(id, 'users.*')
		const end2 = Date.now()
		console.log(`[DATABASE] Tempo de resposta com o cache: ${end2 - start2}ms`)
		console.log(res1, res2)

	}

}