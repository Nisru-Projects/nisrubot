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

			const { image, component } = layer

			const { x, y } = component.position

			const { width, height } = image

			const color = component.color

			const canvasLayer = createCanvas(width, height)

			const ctxLayer = canvasLayer.getContext('2d')

			ctxLayer.translate(width / 2, height / 2)
			ctxLayer.rotate(component.rotation * Math.PI / 180)
			ctxLayer.scale(component.flip ? -1 : 1, component.mirror ? -1 : 1)
			ctxLayer.translate(-width / 2, -height / 2)

			ctxLayer.globalAlpha = component.opacity

			ctxLayer.drawImage(image, 0, 0, width, height)

			const layerData = ctxLayer.getImageData(0, 0, width, height)

			for (let i = 0; i < layerData.data.length; i += 4) {

				const r = layerData.data[i]
				const g = layerData.data[i + 1]
				const b = layerData.data[i + 2]
				const a = layerData.data[i + 3]

				if (r == 0 && g == 0 && b == 0 && a == 0) continue

				layerData.data[i] = parseInt(color.slice(1, 3), 16)
				layerData.data[i + 1] = parseInt(color.slice(3, 5), 16)
				layerData.data[i + 2] = parseInt(color.slice(5, 7), 16)

			}

			ctxLayer.putImageData(layerData, 0, 0)
			ctx.drawImage(canvasLayer, x, y, width, height)

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