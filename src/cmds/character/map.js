const BaseCommand = require('../../utils/BaseCommand')
const Canvas = require('canvas')
const { AttachmentBuilder } = require('discord.js')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: client.languages.content('commands.map.name'),
			description: client.languages.content('commands.map.name'),
			permissions: ['user'],
		})
	}
	async execute(interaction) {

		await interaction.deferReply()

		const tileWidth = 1879
		const tileHeight = 934

		const scale = 0.6
		const playerWidth = tileWidth * scale
		const playerHeight = tileHeight * scale
		const playerPosition = {
			x: 10700,
			y: 3600,
		}

		const playerPositionTile = {
			x: (playerPosition.x % tileWidth) * scale,
			y: (playerPosition.y % tileHeight) * scale,
		}

		const tile = (Math.floor(playerPosition.x / tileWidth) + 1) + (Math.floor(playerPosition.y / tileHeight) * 10)

		const canvas = Canvas.createCanvas(playerWidth, playerHeight)

		const ctx = canvas.getContext('2d')

		const worldTile = await this.client.redisCache.get(`worldTiles:resources/worldTiles/fmg_tile_${tile}.png`)

		const tileData = JSON.parse(worldTile)

		const image = await Canvas.loadImage(Buffer.from(tileData.data, 'base64'))

		ctx.drawImage(image, 0, 0, playerWidth, playerHeight)
		ctx.fillStyle = '#FF0000'
		ctx.fillRect(playerPositionTile.x, playerPositionTile.y, 10, 10)

		ctx.beginPath()
		ctx.arc(playerPositionTile.x + 5, playerPositionTile.y + 5, 50, 0, Math.PI * 2, true)
		ctx.closePath()
		ctx.strokeStyle = '#FF0000'
		ctx.stroke()

		const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'map.png' })

		interaction.editReply({ files: [attachment] })
	}
}