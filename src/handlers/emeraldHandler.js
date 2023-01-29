const EmeraldManager = require('../managers/EmeraldManager')
const LanguagesController = require('../controllers/LanguagesController')

module.exports = async (client) => {

	const emeraldManager = new EmeraldManager(client.config.emeraldtoken)
	const languages = new LanguagesController('pt-BR')

	async function loadLanguages() {
		const res = await emeraldManager.getFiles('nisruemerald', 'languages')

		for (const file of res.data) {
			const content = await emeraldManager.getContent(file.download_url)
			languages.add(content.data)
		}

		client.languages = languages

		console.log(`[LANGUAGE] Loaded ${res.data.length} languages`.green)
	}

	async function loadConfigs() {

		try {
			const res = await emeraldManager.getFiles('nisruemerald', 'resources/configs')

			if (!res.data) return console.log('[CONFIG] No configs found').red

			for (const file of res.data) {
				const content = await emeraldManager.getContent(file.download_url)
				client.redisCache.set(`config:${file.name}`, JSON.stringify(content.data))
			}

			console.log(`[CONFIG] Loaded ${res.data.length} configs`.green)
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
			const res = await emeraldManager.getFiles('nisruemerald', 'resources/worldTiles')
			let count = 0
			for (const tile of res.data) {
				if (tile.type === 'file') {
					const inCache = await client.redisCache.get(`worldTiles:${tile.path}`)
					if (inCache) continue
					const content = await emeraldManager.getContent(tile.download_url, true)
					const tileData = {
						name: tile.name,
						path: tile.path,
						size: tile.size,
						data: content.data,
					}
					client.redisCache.set(`worldTiles:${tileData.path}`, JSON.stringify(tileData))
					count++
				}
			}
			console.log(`[CACHE] Loaded ${count} world tiles`.green)
		}
		catch {
			console.log('[CACHE] No world tiles found'.red)
		}

	}

	async function loadGlobalData() {
		client.dataManager.GlobalData.setClientIfNotExists()
	}
	loadWorldTiles()
	await loadConfigs()
	await loadLanguages()
	await loadSkins()
	await loadGlobalData()

	return true

}