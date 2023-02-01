module.exports = class MiddlewareController {
	constructor(client, interaction) {
		this.client = client
		this.interaction = interaction
	}

	async checkUser() {
		const user = await this.client.dataManager.get(this.interaction.user.id, ['users.*'], true)
		if (user['users.*'] == null) {
			await this.client.dataManager.insert('users.discord_id', this.interaction.user.id)
		}
	}

	async isReadyToPlay() {
		return !Object.values(this.client.readyToPlay)?.includes(false)
	}

	async checkPermissions(cmdPermissions) {

		const user_data = await this.client.dataManager.get(this.interaction.user.id, ['users.permissions'], true)

		const userPermissions = user_data['users.permissions']

		const allOrEvery = cmdPermissions.every(perm => userPermissions.includes(perm)) || userPermissions.includes('*')

		if (allOrEvery) return true

		const userPermissionsArray = userPermissions.map(perm => perm.split('.'))
		const cmdPermissionsArray = cmdPermissions.map(perm => perm.split('.'))
		const userPermissionsArrayLength = userPermissionsArray.length
		const cmdPermissionsArrayLength = cmdPermissionsArray.length

		for (let i = 0; i < userPermissionsArrayLength; i++) {
			for (let j = 0; j < cmdPermissionsArrayLength; j++) {
				if (userPermissionsArray[i][0] === cmdPermissionsArray[j][0] && userPermissionsArray[i][1] === '*' && cmdPermissionsArray[j][1] !== '*') {
					return true
				}
			}
		}

		return false
	}

	async getCharacters() {
		const user = await this.client.dataManager.get(this.interaction.user.id, ['users.selected_character', 'users.characters'], true)
		return {
			selected_character: user['users.selected_character'] == null ? undefined : user['users.selected_character'],
			characters: user['users.characters'] == null ? [] : user['users.characters'],
		}
	}
}