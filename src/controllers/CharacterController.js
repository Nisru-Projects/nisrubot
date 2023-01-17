const randomString = require('../utils/randomString')
const Canvas = require('canvas')
const { createCanvas, loadImage } = Canvas

class SkinManager {
	constructor(client, Character) {
		this.client = client
		this.Character = Character
	}

	async getSkin(character_id) {
		const skin = await this.client.dataManager.get(character_id, 'characters.skin')
		return skin
	}

	async setSkin(character_id, skinData) {
		await this.client.dataManager.set(character_id, 'characters.skin', skinData)
	}

	async makeSkinBuffer(components) {

		const canvas = createCanvas(250, 250)
		const ctx = canvas.getContext('2d')

		/*
			component:
			{
				"part": "avatar",
				"skin": {
					"name": "teste.png",
					"data": base64,
					"path": "resources/skins/characters/avatar/teste.png",
					"size": 442,
				}
				"color": "#ffffff",
				**DEPRECATED** "filters": ["grayscale", "invert", "sepia", "blur", "brightness", "contrast", "saturate", "hue-rotate"],
				"position": { x: 0, y: 0 },
				"rotation": 0,
				"scale": 1,
				"opacity": 1,
				"flip": false,
				"mirror": false,
				"layer": 0,
			}
		*/

		const layers = []

		for (const component of components) {

			if (component.skin == null) return console.log(`[SKIN] Component ${component.part} is null`, component)

			const buffer = Buffer.from(component.skin.data, 'base64')

			const image = await loadImage(buffer)

			layers.push({
				image,
				component,
			})

		}

		layers.sort((a, b) => a.component.layer - b.component.layer)

		for (const layer of layers) {

			ctx.save()

			ctx.translate(layer.component.position.x, layer.component.position.y)
			ctx.rotate(layer.component.rotation * Math.PI / 180)
			ctx.scale(layer.component.scale, layer.component.scale)
			ctx.globalAlpha = layer.component.opacity

			if (layer.component.flip) {
				ctx.scale(-1, 1)
				ctx.translate(-layer.image.width, 0)
			}

			if (layer.component.mirror) {
				ctx.scale(1, -1)
				ctx.translate(0, -layer.image.height)
			}

			ctx.drawImage(layer.image, 0, 0)

			ctx.restore()

		}

		const buffer = canvas.toBuffer('image/png')
		return buffer
	}

}

module.exports = class CharacterController {
	constructor(client, user) {
		const skinManager = new SkinManager(client, this)
		this.client = client
		this.user = user
		this.getSkin = skinManager.getSkin.bind(skinManager)
		this.setSkin = skinManager.setSkin.bind(skinManager)
		this.makeSkinBuffer = skinManager.makeSkinBuffer.bind(skinManager)
	}

	getCharacterInfo(character_id, table) {
		return this.client.dataManager.get(character_id, `${table}.*`)
	}

	getCacheSkins() {
		return this.client.redisCache.get('skins')
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