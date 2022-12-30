module.exports = class CacheManager {
	constructor(client) {
		this.client = client
	}

	get isConnected() {
		return this.client.connected
	}

	connect() {
		return this.client.connect()
	}

	clear() {
		return this.client.flushAll()
	}

	set(key, value) {
		return this.client.set(key, value)
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