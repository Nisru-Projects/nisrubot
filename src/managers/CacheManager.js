module.exports = class CacheManager {
	constructor(client) {
		this.client = client
	}

	loadData() {
		this.client.redisCache = this
		this.connect().then(() => {
			console.log('[REDIS] Connected'.green)
		}).catch(err => {
			console.log(`[REDIS] Not connected: ${err.message}`.red)
			process.exit(1)
		})

		return this
	}

	connect() {
		return this.client.connect()
	}

	clear() {
		return this.client.flushall()
	}

	set(key, value, expiration_time) {

		if (expiration_time) {
			return this.client.set(key, value, 'EX', expiration_time)
		}
		return this.client.set(key, value)
	}

	add(key, value) {
		return this.client.add(key, value)
	}

	get(key) {
		return this.client.get(key)
	}

	delete(key) {
		return this.client.del(key)
	}

	exists(key) {
		return this.client.exists(key)
	}
}