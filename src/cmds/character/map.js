const BaseCommand = require('../../utils/BaseCommand')
const Canvas = require('canvas')
const { AttachmentBuilder } = require('discord.js')
const randomNumber = require('../../utils/randomNumber')
const isWater = require('../../utils/isWater')

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
		const totalWidth = tileWidth * 10
		const totalHeight = tileHeight * 10

		const isRouting = true

		const routingToPosition = {
			x: randomNumber(0, totalWidth),
			y: randomNumber(0, totalHeight),
		}

		const playerPosition = {
			x: randomNumber(0, totalWidth),
			y: randomNumber(0, totalHeight),
		}

		const playerPositionTile = {
			x: (playerPosition.x % tileWidth) * scale,
			y: (playerPosition.y % tileHeight) * scale,
		}

		const routingToPositionTileDirection = {
			x: (routingToPosition.x % tileWidth) * scale,
			y: (routingToPosition.y % tileHeight) * scale,
		}

		const routingAngle = (Math.atan2(routingToPositionTileDirection.y - playerPositionTile.y, routingToPositionTileDirection.x - playerPositionTile.x) * 180 / Math.PI).toFixed(2)

		const tile = (Math.floor(playerPosition.x / tileWidth) + 1) + (Math.floor(playerPosition.y / tileHeight) * 10)

		const routingTile = (Math.floor(routingToPosition.x / tileWidth) + 1) + (Math.floor(routingToPosition.y / tileHeight) * 10)

		const canvas = Canvas.createCanvas(playerWidth, playerHeight)

		const ctx = canvas.getContext('2d')

		const worldTile = await this.client.redisCache.get(`worldTiles:resources/worldTiles/fmg_tile_${tile}.png`)

		const tileData = JSON.parse(worldTile)

		const image = await Canvas.loadImage(Buffer.from(tileData.data, 'base64'))

		ctx.drawImage(image, 0, 0, playerWidth, playerHeight)

		const checkArea = 50

		const imageCheckAreaData = ctx.getImageData(playerPositionTile.x - checkArea, playerPositionTile.y - checkArea, checkArea * 2, checkArea * 2)

		const checkAreaCanvas = Canvas.createCanvas(checkArea, checkArea)
		const checkAreaCtx = checkAreaCanvas.getContext('2d')
		checkAreaCtx.putImageData(imageCheckAreaData, 0, 0)

		ctx.fillStyle = '#FF0000'
		ctx.fillRect(playerPositionTile.x, playerPositionTile.y, 10, 10)

		ctx.beginPath()
		ctx.arc(playerPositionTile.x + 5, playerPositionTile.y + 5, 25, 0, Math.PI * 2, true)
		ctx.closePath()
		ctx.strokeStyle = '#FF0000'
		ctx.stroke()

		ctx.font = '20px Arial'
		ctx.fillStyle = '#FFFFFF'
		ctx.fillText(`X: ${playerPosition.x}, Y: ${playerPosition.y}`, playerPositionTile.x + 10, playerPositionTile.y - 10)

		const { waterPercentage } = isWater(checkAreaCanvas, checkAreaCtx)

		const inWater = waterPercentage > 0.6

		if (inWater) {
			ctx.beginPath()
			ctx.arc(playerPositionTile.x + 5, playerPositionTile.y + 5, 30, 0, Math.PI * 2, true)
			ctx.closePath()
			ctx.strokeStyle = '#00FF00'
			ctx.stroke()
		}

		if (inWater) {
			ctx.fillText('🌊', playerPositionTile.x + 10, playerPositionTile.y + 20)
		}

		if (isRouting) {
			ctx.beginPath()
			ctx.moveTo(playerPositionTile.x + 5, playerPositionTile.y + 5)
			ctx.lineTo(playerPositionTile.x + 5 + (Math.cos(routingAngle * Math.PI / 180) * 1000), playerPositionTile.y + 5 + (Math.sin(routingAngle * Math.PI / 180) * 1000))
			ctx.closePath()
			ctx.strokeStyle = '#FF00FF'
			ctx.lineWidth = 5
			ctx.setLineDash([3, 15])
			ctx.stroke()
		}

		const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'map.png' })
		const isRoutingMessage = isRouting ? `Rota para X: ${routingToPosition.x}, Y: ${routingToPosition.y}, Tile: ${routingTile}, Angulo: ${routingAngle}` : ''
		interaction.editReply({ content: `[X: ${playerPosition.x}, Y: ${playerPosition.y}, Tile: ${tile}]\n${isRoutingMessage}\nEm água: ${inWater} (${waterPercentage * 100}%)`, files: [attachment] })
	}
}