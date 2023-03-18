import { createClient } from 'redis'
import type { NisruClient } from '../Nisru'
const redisClient = createClient({ url: `redis://${process.env.REDIS_HOST || 'localhost'}:6379` })
class RedisManager {
	loadData(client: NisruClient) {
		client.redisCache = this
		const time = Date.now()
		this.connect().then(() => {
			console.log(`[CACHE] Connected in ${(Date.now() - time) / 1000}s`.green)
			this.clearWithPrefix('actions:').then(() => {
				console.log('[CACHE] Actions cleared'.yellow)
			})
		}).catch(err => {
			console.log(`[CACHE] Not connected: ${err.message}`.red)
			process.exit(1)
		})

		return this
	}

	connect() {
		return redisClient.connect()
	}

	async clearWithPrefix(prefix) {
		const keys = await redisClient.keys(`${prefix}*`)
		if (keys.length) {
			return redisClient.del(keys)
		}
	}

	clearAll() {
		return redisClient.flushAll()
	}

	set(key: string, value: string, expiration_time?: number) {

		if (expiration_time) {
			return redisClient.set(key, value, 'EX', expiration_time)
		}
		return redisClient.set(key, value)
	}

	add(key, value) {
		return redisClient.add(key, value)
	}

	get(key) {
		return redisClient.get(key)
	}

	delete(key) {
		return redisClient.del(key)
	}

	exists(key) {
		return redisClient.exists(key)
	}
}
export default RedisManager
export type { RedisManager }