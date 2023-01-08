const randomString = require('../utils/randomString')
const Canvas = require('canvas')

module.exports = class CharacterController {
	constructor(client, user) {
		this.client = client
		this.user = user
	}

	getCharacterInfo(character_id, table) {
		return this.client.dataManager.get(character_id, `${table}.*`)
	}

	getCacheSkins() {
		return this.client.redisCache.get('skins')
	}

	async getSkin(character_id) {
		const skin = await this.client.dataManager.get(character_id, 'characters.skin')
		return skin
	}

	async makeSkin(character_id, part, paths) {
		const { createCanvas, loadImage } = Canvas
		const canvas = createCanvas(250, 250)
		const ctx = canvas.getContext('2d')

		for (const path of paths) {
			const imagebuffer = await this.client.redisCache.get(`skins:${path}`)
			const image = await loadImage(imagebuffer)
			ctx.drawImage(image, 0, 0, 250, 250)
		}

		const buffer = canvas.toBuffer('image/png')
		return buffer
	}

	async getCharacters() {

		const user_data = await this.client.dataManager.get(this.user.id, ['users.selected_character', 'users.characters'])

		this.characters = {
			selected_character: user_data.characters == null ? undefined : user_data.selected_character,
			characters: user_data.characters == null ? [] : user_data.characters,
		}

		return this.characters

	}

	async create(data) {
		let character_id = randomString(16)

		while ((await this.client.dataManager.get(character_id, 'characters_geral'))['characters_geral.*'] != null) {
			character_id = randomString(16)
		}

		data.character_id = character_id

		const essence = {
			name: data.name,
			gender: data.gender,
			element: data.element,
			race: data.race,
			constellation: data.constellation,
			gamemode: data.gamemode,
		}

		await this.client.dataManager.insert('characters_geral.character_id', data.character_id)

		await this.client.dataManager.set(
			{ 'characters_geral': character_id, 'users': data.user_id },
			{
				'characters_geral.essence': essence,
				'characters_geral.attributes': data.baseAttributes,
				'users.characters': this.client.knexDatabase.raw('array_append(characters, ?)', [character_id]),
				'users.selected_character': character_id,
			})

	}

	deleteCharacter(character_id) {
		return this.client.knexDatabase('users').where('discord_id', this.user.id).update({
			characters: this.client.knexDatabase.raw('array_remove(characters, ?)', [character_id]),
		})
	}

	selectCharacter(character_id) {
		return this.client.dataManager.set({ 'users': this.user.id }, { 'users.selected_character': character_id })
	}

	updateCharacter(character_id, table, data) {
		return this.client.knexDatabase(table).where('character_id', character_id).update(data)
	}

	async transferCharacter(new_user, character_id) {
		await this.client.knexDatabase('users').where('discord_id', this.user.id).update({
			characters: this.client.knexDatabase.raw('array_remove(characters, ?)', [character_id]),
			selected_character: null,
		})

		return await this.client.knexDatabase('users').where('discord_id', new_user.id).update({
			characters: this.client.knexDatabase.raw('array_append(characters, ?)', [character_id]),
			selected_character: character_id,
		})
	}

}