const randomString = require('../utils/randomString')

/*
**character_id**: BIGINT (Timestamp)

**skin**: JSON {

}

**exp**: BIGINT

**attributes**: JSON {

}

**essence**: JSON {

class: TEXT

race: TEXT

constellation: TEXT

}
*/

const DataController = require('./DataController')

module.exports = class CharacterController {
	constructor(client, user) {
		this.client = client
		this.user = user
		this.DataController = new DataController(client.knexDatabase, client.cache)
	}

	getCharacterInfo(character_id, table) {
		return this.DataController.get(character_id, `${table}.*`)
	}

	async getCharacters() {
		const user_data = await this.client.knexDatabase.select('characters', 'selected_character').from('users').where('discord_id', this.user.id).first()
		this.characters = {
			selected_character: user_data.characters == null ? undefined : user_data.selected_character,
			characters: user_data.characters == null ? [] : user_data.characters,
		}
		return this.characters
	}

	async createCharacter(data) {
		let character_id = randomString(16)

		while (await this.client.knexDatabase.select('character_id').from('characters_geral').where('character_id', character_id).first()) {
			character_id = randomString(16)
		}

		data.character_id = character_id

		await this.client.knexDatabase('users').where('discord_id', this.user.id).update({

			characters: this.client.knexDatabase.raw('array_append(characters, ?)', [character_id]),
			selected_character: character_id,
		})

		return await this.client.knexDatabase('characters_geral').insert(data)
	}

	deleteCharacter(character_id) {
		return this.client.knexDatabase('users').where('discord_id', this.user.id).update({
			characters: this.client.knexDatabase.raw('array_remove(characters, ?)', [character_id]),
		})
	}

	selectCharacter(character_id) {
		return this.client.knexDatabase('users').where('discord_id', this.user.id).update({
			selected_character: character_id,
		})
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