const fs = require('fs')
const path = require('path')
module.exports = class DataManager {
	constructor(knexDatabase, redisCache) {
		this.knexDatabase = knexDatabase
		this.redisCache = redisCache
	}

	async createBackup() {
		const backupFiles = fs.readdirSync(path.join(__dirname, '..', '..', 'backups'))
		const lastBackup = backupFiles[backupFiles.length - 1]
		if (lastBackup) {
			const date = lastBackup.split('_')[0].split('-').reverse().join('-') + ' ' + lastBackup.split('_')[1].split('-').join(':').replace('.json', '')
			const lastBackupDate = new Date(date)
			const now = new Date()
			const difference = now.getTime() - lastBackupDate.getTime()
			const differenceInHours = Math.round(difference / (1000 * 3600))
			if (differenceInHours < 24) return console.log('[DATABASE] Backup already created today'.yellow)
		}
		try {
			const backup = await this.knexDatabase.raw('SELECT * FROM information_schema.tables WHERE table_schema = \'public\'')
			const tables = backup.rows.map(table => table.table_name)
			const backupData = {}
			for (const table of tables) {
				const data = await this.knexDatabase.raw(`SELECT * FROM ${table}`)
				backupData[table] = data
			}
			const formattedDate = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }).replace(/\//g, '-').replace(/:/g, '-').replace(/ /g, '_').replace(/,/g, '')
			const backupPath = path.join(__dirname, '..', '..', 'backups', `${formattedDate}.json`)
			const backupDataString = JSON.stringify(backupData, null, 2)
			fs.writeFileSync(backupPath, backupDataString)
			console.log(`[DATABASE] Backup created: ${formattedDate}`.green)
		}
		catch (error) {
			console.log(`[DATABASE] Error creating backup: ${error}`.red)
		}
	}

	async deleteOldBackups() {
		const backupDir = path.join(__dirname, '..', '..', 'backups')
		const files = fs.readdirSync(backupDir)
		const filesToDelete = files.filter(file => {
			const fileDate = new Date(file.split('_')[0].split('-').reverse().join('-'))
			const currentDate = new Date()
			const diff = currentDate.getTime() - fileDate.getTime()
			const diffDays = Math.ceil(diff / (1000 * 3600 * 24))
			return diffDays > 14
		})
		for (const file of filesToDelete) {
			console.log(`[DATABASE] Deleting backup: ${file}`.yellow)
			fs.unlinkSync(path.join(backupDir, file))
		}
	}

	restoreBackup(backupPath) {
		return new Promise(async (resolve) => {
			const backupData = JSON.parse(fs.readFileSync(backupPath))
			const tables = Object.keys(backupData)
			for (const table of tables) {
				await this.knexDatabase.raw(`DROP TABLE IF EXISTS ${table}`)
				await this.knexDatabase.raw(backupData[table].command)
				const rows = backupData[table].rows
				for (const row of rows) {
					const columns = Object.keys(row)
					const values = Object.values(row)
					const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map((column, index) => `$${index + 1}`).join(', ')})`
					await this.knexDatabase.raw(query, values)
				}
			}
			resolve()
		})
	}

	getPrimaryKey(key) {
		if (!key.includes('.')) key = `${key}.*`
		const primaryKey = this.knexDatabase.keys.find(keyobj => keyobj.key === key)?.primaryKey
		const receivedFrom = new Error().stack.split('\n')[2].trim()
		if (!primaryKey) return console.log(`[DATABASE] Invalid key: ${key}\n${receivedFrom}`.red)
		return primaryKey
	}

	updateCache(primaryValue, key, value) {

		if (value) {
			return this.redisCache.set(`${key}:${primaryValue}`, JSON.stringify(value), 60 * 60 * 2)
		}

		return new Promise(async (resolve) => {
			const primaryKey = this.getPrimaryKey(key)
			const query = `SELECT ${key.split('.')[1]} FROM ${key.split('.')[0]} WHERE ${primaryKey} = ?`
			const result = await this.query(query, [primaryValue])
			if (result.rows.length > 0) {
				this.redisCache.set(`${key}:${primaryValue}`, JSON.stringify(result.rows[0]), 60 * 60 * 2)
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
			const receivedFrom = new Error().stack.split('\n')[2].trim()
			if (!this.validKey(key)) return console.log(`[DATABASE] Invalid key: ${key}\n${receivedFrom}`.red)
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

		const receivedFrom = new Error().stack.split('\n')[2].trim()

		if (typeof values !== 'object') return console.log(`[DATABASE] Invalid values type: ${typeof values}, expected object. Values: ${values}, primaryValues: ${primaryValues}\n${receivedFrom}`.red)
		if (typeof primaryValues !== 'object') return console.log(`[DATABASE] Invalid primaryValues type: ${typeof primaryValues}, expected object. Values: ${primaryValues}\n${receivedFrom}`.red)

		const keys = Object.keys(values).map(key => {
			if (!key.includes('.')) return `${key}.*`
			else return key
		})

		for (const key of keys) {
			const threeSimilarKeys = this.knexDatabase.keys.filter(keyobj => keyobj.key.includes(key.split('.')[0])).map(keyobj => keyobj.key).slice(0, 3)
			if (!this.validKey(key)) return console.log(`[DATABASE] Invalid key: ${key.toUpperCase()} in values: ${values}, expected object. Values: ${values} and primaryValues: ${primaryValues}\n${receivedFrom}\nSimilar keys: ${threeSimilarKeys}`.red)
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
				await this.redisCache.delete(`${table}.*:${primaryValues[table]}`)
				// eslint-disable-next-line no-shadow
				for (const key of keys.filter(key => key.split('.')[0] === table)) {
					await this.redisCache.delete(`${key}:${primaryValues[table]}`)
				}
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