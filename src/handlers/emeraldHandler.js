const EmeraldManager = require('../managers/EmeraldManager')
const LanguagesController = require('../controllers/LanguagesController')

module.exports = async (client) => {

	const emeraldManager = new EmeraldManager(client.config.emeraldtoken)
	const languages = new LanguagesController('pt-BR')

	async function loadLanguages() {

		const time = Date.now()

		const res = await emeraldManager.getFiles('nisruemerald', 'languages')

		for (const file of res.data) {
			const content = await emeraldManager.getContent(file.download_url)
			languages.add(content.data)
		}

		client.languages = languages

		console.log(`[LANGUAGE] Loaded ${res.data.length} languages in ${(Date.now() - time) / 1000}s`.green)
	}

	async function loadConfigs() {

		const time = Date.now()

		try {
			const res = await emeraldManager.getFiles('nisruemerald', 'resources/configs')

			if (!res.data) return console.log('[CONFIG] No configs found').red

			for (const file of res.data) {
				const content = await emeraldManager.getContent(file.download_url)
				client.redisCache.set(`config:${file.name}`, JSON.stringify(content.data))
			}

			console.log(`[CONFIG] Loaded ${res.data.length} configs in ${(Date.now() - time) / 1000}s`.green)
		}
		catch (error) {
			console.log('[CONFIG] No configs found'.red)
		}

	}

	async function loadSkins() {
		const res = await emeraldManager.getFiles('nisruemerald', 'resources/characters/skins')
		res.data.forEach(async type => {
			if (type.type === 'dir') {
				const files = await emeraldManager.getFiles('nisruemerald', `resources/characters/skins/${type.name}`)
				files.data.forEach(async file => {
					if (file.type === 'file') {
						const content = await emeraldManager.getContent(file.download_url, true)
						const skinData = {
							name: file.name,
							path: file.path,
							size: file.size,
							data: content.data,
						}
						client.redisCache.set(`skins:${skinData.path}`, JSON.stringify(skinData))
					}
				})
			}
		})
	}

	async function loadWorldTiles() {

		try {
			const res = await emeraldManager.getFiles('nisruemerald', 'resources/fullworld.png')
			const content = await emeraldManager.getContent(res.data[0].download_url, true)
			client.redisCache.set('fullworld', content.data)
		}
		catch (error) {
			console.log('[CACHE] No fullworld file found'.red)
		}

		const time = Date.now()

		try {
			const res = await emeraldManager.getFiles('nisruemerald', 'resources/worldTiles')
			let count = 0
			const tiles = []
			for (const tile of res.data) {
				if (tile.type === 'file') {
					const tileData = {
						name: tile.name,
						path: tile.path,
						size: tile.size,
						data: undefined,
					}
					tiles.push(tileData)
					const inCache = await client.redisCache.get(`worldTiles:${tile.path}`)
					if (inCache) continue
					const content = await emeraldManager.getContent(tile.download_url, true)
					tileData.data = content.data
					client.redisCache.set(`worldTiles:${tileData.path}`, JSON.stringify(tileData))
					count++
				}
			}
			client.redisCache.set('worldTilesData', JSON.stringify(tiles))
			console.log(`[CACHE] Loaded ${count} world tiles in ${(Date.now() - time) / 1000}s`.green)
		}
		catch (err) {
			console.log('[CACHE] No world tiles found'.red)
			console.log(err)
		}

	}

	async function loadGlobalData() {
		client.dataManager.GlobalData.setClientIfNotExists()
	}

	client.readyToPlay = {
		worldtiles: false,
		configs: false,
		languages: false,
		skins: false,
		globalData: false,
	}
	await loadWorldTiles()
	client.readyToPlay.worldtiles = true
	await loadConfigs()
	client.readyToPlay.configs = true
	await loadLanguages()
	client.readyToPlay.languages = true
	await loadSkins()
	client.readyToPlay.skins = true
	await loadGlobalData()
	client.readyToPlay.globalData = true

	return true

}