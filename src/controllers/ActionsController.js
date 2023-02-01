module.exports = class ActionsController {
	constructor(redisCache) {
		this.redisCache = redisCache
	}

	async getActions(userId) {
		const actions = await this.redisCache.get(`actions:${userId}`)
		const actionsArray = actions == null ? [] : JSON.parse(actions)
		const actionsMap = new Map(actionsArray)
		return actionsMap
	}

	async inAction(userId, actionId) {
		const actions = await this.getActions(userId)
		return actions.has(actionId)
	}

	async addAction(userId, action) {
		const actions = await this.getActions(userId)
		actions.set(action.id, action)
		await this.redisCache.set(`actions:${userId}`, JSON.stringify([...actions]), action.duration)
	}

	async removeAction(userId, actionsIds) {
		const actions = await this.getActions(userId)
		actionsIds = Array.isArray(actionsIds) ? actionsIds : [actionsIds]
		actionsIds.forEach(actionId => actions.delete(actionId))
		await this.redisCache.set(`actions:${userId}`, JSON.stringify([...actions]))
	}

}