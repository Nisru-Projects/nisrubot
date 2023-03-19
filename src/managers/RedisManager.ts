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

	async clearWithPrefix(prefix: string) {
		const keys = await redisClient.keys(`${prefix}*`)
		if (keys.length) {
			return redisClient.del(keys)
		}
	}

	clearAll() {
		return redisClient.flushAll()
	}

	set(key: any, value: any, expiration_time?: any) {

		if (expiration_time) {
			return redisClient.set(key, value, 'EX', expiration_time)
		}
		return redisClient.set(key, value)
	}

	add(key: any, value: any) {
		return redisClient.sAdd(key, value)
	}

	get(key: any) {
		return redisClient.get(key)
	}

	delete(key: any) {
		return redisClient.del(key)
	}

	exists(key: any) {
		return redisClient.exists(key)
	}
}
export default RedisManager
export type { RedisManager }