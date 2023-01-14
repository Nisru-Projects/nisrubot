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

	async function loadSkins() {
		const res = await emeraldManager.getFiles('nisruemerald', 'resources/characters/skins')
		res.data.forEach(async dir => {
			if (dir.type === 'dir') {
				const bodypart = await emeraldManager.getFiles('nisruemerald', `resources/characters/skins/${dir.name}`)
				bodypart.data.forEach(async type => {
					if (type.type === 'dir') {
						const files = await emeraldManager.getFiles('nisruemerald', `resources/characters/skins/${dir.name}/${type.name}`)
						files.data.forEach(async file => {
							if (file.type === 'file') {
								const content = await emeraldManager.getContent(file.download_url, true)
								const skinData = {
									name: file.name,
									path: file.path,
									size: file.size,
									buffer: content.data,
								}
								skinData.base64 = Buffer.from(skinData.buffer).toString('base64')
								client.redisCache.set(`skins:${skinData.path}`, JSON.stringify(skinData))
							}
						})
					}
				})
			}
			else {
				const content = await emeraldManager.getContent(dir.download_url)
				client.redisCache.set('skins:data', JSON.stringify(content.data))
			}
		})
	}

	await loadLanguages()
	await loadSkins()

	return true

}