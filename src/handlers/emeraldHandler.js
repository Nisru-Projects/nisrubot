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

		console.log(res.data)
	}

	await loadLanguages()
	await loadSkins()

	return true

}