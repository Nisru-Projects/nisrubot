module.exports = class MiddlewareController {
	constructor(client, interaction) {
		this.client = client
		this.interaction = interaction
	}

	async checkUser() {
		this.client.dataController.get(this.interaction.user.id, 'users.*').then(async (user) => {
			if (!user) {
				await this.client.knexDatabase('users').insert({
					discord_id: this.interaction.user.id,
				}).then(async () => {
					this.user = await this.client.knexDatabase.select('*').from('users').where('discord_id', this.interaction.user.id).first()
					console.log(`[DATABASE] User ${this.interaction.user.id} created`.green)
				})
			}
		})
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
		const user = this.user || await this.client.knexDatabase.select('characters', 'selected_character').from('users').where('discord_id', this.interaction.user.id).first()
		return {
			selected_character: user.characters == null ? undefined : user.selected_character,
			characters: user.characters == null ? [] : user.characters,
		}
	}
}