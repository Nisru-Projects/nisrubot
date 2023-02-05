const BaseCommand = require('../../utils/BaseCommand')
const Canvas = require('canvas')
const { AttachmentBuilder, EmbedBuilder } = require('discord.js')
const randomNumber = require('../../utils/randomNumber')
const isWater = require('../../utils/isWater')

module.exports = class Command extends BaseCommand {
	constructor(client) {
		super(client, {
			name: 'map',
			permissions: ['user'],
		})
	}
	async execute(interaction) {

		await interaction.deferReply()

		const redisCache = this.client.redisCache

		const tileWidth = 1879
		const tileHeight = 931

		const scale = 1
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
			x: (playerPosition.x - Math.floor(playerPosition.x / tileWidth) * tileWidth),
			y: (playerPosition.y - Math.floor(playerPosition.y / tileHeight) * tileHeight),
		}

		const routingToPositionTileDirection = {
			x: (routingToPosition.x - Math.floor(routingToPosition.x / tileWidth) * tileWidth),
			y: (routingToPosition.y - Math.floor(routingToPosition.y / tileHeight) * tileHeight),
		}

		const tile = (Math.floor(playerPosition.x / tileWidth) + 1) + (Math.floor(playerPosition.y / tileHeight) * 10) - 1

		const playerExploredTiles = []

		for (let i = 0; i < randomNumber(80, 100); i++) {
			const tileN = randomNumber(0, 100)
			if (playerExploredTiles.find(t => t.tile === tileN)) continue
			playerExploredTiles.push({
				percentage: randomNumber(80, 100),
				tile: tileN,
			})
		}

		for (let i = 0; i < 100; i++) {
			if (playerExploredTiles.find(t => t.tile === i)) continue
			playerExploredTiles.push({
				percentage: 0,
				tile: i,
			})
		}

		playerExploredTiles.sort((a, b) => a.tile - b.tile)

		async function getLocalMap() {

			const routingAngle = (Math.atan2(routingToPositionTileDirection.y - playerPositionTile.y, routingToPositionTileDirection.x - playerPositionTile.x) * 180 / Math.PI).toFixed(2)

			const routingTile = (Math.floor(routingToPosition.x / tileWidth) + 1) + (Math.floor(routingToPosition.y / tileHeight) * 10)

			const canvas = Canvas.createCanvas(playerWidth, playerHeight)

			const ctx = canvas.getContext('2d')

			const worldTile = await redisCache.get(`worldTiles:resources/worldTiles/fmg_tile_${tile}.png`)

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
			return { buffer: canvas.toBuffer(), routingTile, routingAngle, inWater, waterPercentage }
		}

		async function getFullMap() {

			const fullmap = await redisCache.get('fullworld')
			const fullmapData = JSON.parse(fullmap)

			const fullmapImage = await Canvas.loadImage(Buffer.from(fullmapData.data, 'base64'))

			const canvas = Canvas.createCanvas(fullmapImage.width, fullmapImage.height)

			const ctx = canvas.getContext('2d')

			// o tamanho total é 10x10 tiles, cada tile tem tileWidth x tileHeight pixels, calcular a posição do player no mapa completo
			const playerPositionFullMap = {
				x: (playerPosition.x / fullmapImage.width / 10) * fullmapImage.width,
				y: (playerPosition.y / fullmapImage.height / 10) * fullmapImage.height,
			}

			const routingToPositionFullMap = {
				x: (routingToPosition.x / fullmapImage.width / 10) * fullmapImage.width,
				y: (routingToPosition.y / fullmapImage.height / 10) * fullmapImage.height,
			}

			const tileWidthInFullMap = fullmapImage.width / 10
			const tileHeightInFullMap = fullmapImage.height / 10

			ctx.drawImage(fullmapImage, 0, 0, fullmapImage.width, fullmapImage.height)

			// fazer uma grid, separando em 100 tiles
			/*
			for (let i = 0; i <= 10; i++) {
				ctx.beginPath()
				ctx.moveTo(i * tileWidthInFullMap, 0)
				ctx.lineTo(i * tileWidthInFullMap, fullmapImage.height)
				ctx.closePath()
				ctx.strokeStyle = '#FFFFFF'
				ctx.stroke()
			}

			for (let i = 0; i <= 10; i++) {
				ctx.beginPath()
				ctx.moveTo(0, i * tileHeightInFullMap)
				ctx.lineTo(fullmapImage.width, i * tileHeightInFullMap)
				ctx.closePath()
				ctx.strokeStyle = '#FFFFFF'
				ctx.stroke()
			}*/

			for (let i = 0; i < 10; i++) {
				for (let j = 0; j < 10; j++) {
					const currentCheckTile = ((j * 10) + i)
					const explored = playerExploredTiles.find(ptile => ptile.tile === currentCheckTile)
					// adicionar mais um pixel no width e height para não ficar com um pixel branco na borda
					const imageData = ctx.getImageData(i * tileWidthInFullMap, j * tileHeightInFullMap, tileWidthInFullMap + 1, tileHeightInFullMap + 1)
					const data = imageData.data
					for (let pixels = 0; pixels < data.length; pixels += 4) {
						const minGray = (data[pixels] + data[pixels + 1] + data[pixels + 2]) / 3
						const intensity = explored.percentage / 100
						data[pixels] = data[pixels] * intensity + minGray * (1 - intensity)
						data[pixels + 1] = data[pixels + 1] * intensity + minGray * (1 - intensity)
						data[pixels + 2] = data[pixels + 2] * intensity + minGray * (1 - intensity)
					}
					ctx.putImageData(imageData, i * tileWidthInFullMap, j * tileHeightInFullMap)
					if (explored.tile == tile) {
						ctx.font = '20px Arial'
						ctx.fillStyle = '#FFFFFF'
						ctx.fillText(`${explored.percentage}%`, i * tileWidthInFullMap + 10, j * tileHeightInFullMap + 20)
					}
				}
			}


			ctx.fillStyle = '#FF0000'
			ctx.fillRect(playerPositionFullMap.x, playerPositionFullMap.y, 10, 10)

			ctx.beginPath()
			ctx.arc(playerPositionFullMap.x + 7, playerPositionFullMap.y + 7, 30, 0, Math.PI * 2, true)
			ctx.closePath()
			ctx.strokeStyle = '#FF0000'
			ctx.stroke()

			// desenhar a rota
			if (isRouting) {
				ctx.beginPath()
				ctx.moveTo(playerPositionFullMap.x + 5, playerPositionFullMap.y + 5)
				ctx.lineTo(routingToPositionFullMap.x + 5, routingToPositionFullMap.y + 5)
				ctx.closePath()
				ctx.strokeStyle = '#FF0000'
				ctx.setLineDash([5, 15])
				ctx.stroke()

				ctx.beginPath()
				ctx.arc(routingToPositionFullMap.x + 5, routingToPositionFullMap.y + 5, 30, 0, Math.PI * 2, true)
				ctx.closePath()
				// outra cor para a rota
				ctx.strokeStyle = '#FF0000'
				ctx.stroke()

				ctx.fillStyle = '#FF0000'
				ctx.fillRect(routingToPositionFullMap.x, routingToPositionFullMap.y, 10, 10)

			}

			return { buffer: canvas.toBuffer() }
		}

		const localMap = await getLocalMap()
		const fullMap = await getFullMap()

		const fullMapAttachment = new AttachmentBuilder(fullMap.buffer, { name: 'fullmap.png' })
		const localMapAttachment = new AttachmentBuilder(localMap.buffer, { name: 'localmap.png' })
		const isRoutingMessage = isRouting ? `Rota para X: ${routingToPosition.x}, Y: ${routingToPosition.y}, Tile: ${localMap.routingTile}, Angulo: ${localMap.routingAngle}` : ''

		const embedMap = new EmbedBuilder()
			.setTitle('Mapa completo')
			.setImage('attachment://fullmap.png')

		const embedLocalMap = new EmbedBuilder()
			.setTitle('Mapa local')
			.setImage('attachment://localmap.png')

		interaction.editReply({ embeds: [embedMap, embedLocalMap], content: `[X: ${playerPosition.x}, Y: ${playerPosition.y}, Tile: ${tile}]\n${isRoutingMessage}\nEm água: ${localMap.inWater} (${localMap.waterPercentage * 100}%)`, files: [localMapAttachment, fullMapAttachment] })
	}
}