import RedisManager from '../managers/RedisManager'
import type { UserAction, UserActions, UserActionsMap, StringifiedUserAction } from '../types/actions'
import type { userId } from '../types/utils'

export default class ActionsController {
	redisCache: RedisManager
	constructor(redisCache: RedisManager) {
		this.redisCache = redisCache
	}

	async getActions(userId: userId): Promise<UserActionsMap> {
		const actions = await this.redisCache.get(`actions:${userId}`)
		const actionsArray = actions == null ? [] : JSON.parse(actions)
		const actionsMap: UserActionsMap = new Map(actionsArray)
		return actionsMap
	}

	async inAction(userId: userId, actionId: string) {
		const actions = await this.getActions(userId)
		return actions.has(actionId)
	}

	async addAction(userId: userId, action: UserAction) {
		const actions = await this.getActions(userId)
		actions.set(action.id, action)
		// isso aq ta errado boy, setando todas as actions mas pelo tempo da ultima??? refaz isso ai loco
		await this.redisCache.set(`actions:${userId}`, JSON.stringify([...actions]), action.duration)
	}

	async removeAction(userId: userId, actionsIds: string[]) {
		const actions = await this.getActions(userId)
		actionsIds = Array.isArray(actionsIds) ? actionsIds : [actionsIds]
		actionsIds.forEach(actionId => actions.delete(actionId))
		await this.redisCache.set(`actions:${userId}`, JSON.stringify([...actions]))
	}

}