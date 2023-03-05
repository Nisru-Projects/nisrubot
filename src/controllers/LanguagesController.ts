type Language = string
type LanguageContent = Record<string, string | LanguageContent>

export default class LanguagesController {

	lang: Language

	constructor(lang: Language) {
		this.lang = lang || 'pt-BR'
	}

	set(name: Language, lang: LanguageContent) {
		this[name] = lang
	}

	get(lang: Language) {
		return this[lang]
	}

	getCommandKey(translatedCommand: string, lang = this.lang) {
		const keys = Object.keys(this.get(lang).commands)

		for (const key of keys) {
			if (this.get(lang).commands[key].name == translatedCommand) {
				return key
			}
		}

		return translatedCommand
	}

	add(lang: LanguageContent) {
		this.set(lang.name, lang)
	}

	content(key, vars, lang = this.lang) {
		try {
			if (!this.get(lang)) {
				const receivedFrom = new Error().stack.split('\n')[2].trim()
				console.log(`[LANGUAGE] Language ${lang} not found\n${receivedFrom}`.red)
				return process.exit(1)
			}
			let contentkey = this.get(lang)

			const keyify = key.split('.')

			keyify.forEach(k => {
				if (!contentkey[k]) {
					throw new Error('Key not found')
				}
				contentkey = contentkey[k]
			})
			if (!contentkey) {
				throw new Error('Key not found')
			}
			return this.read(contentkey, vars, lang)
		}
		catch (error) {
			if (vars && vars.undefined) {
				return this.content(vars.undefined, vars, lang)
			}
			const receivedFrom = new Error().stack.split('\n')[2].trim()
			console.log(`[LANGUAGE] An error occurred while trying to get the content of the key ${key} in the language ${lang}\nERROR MESSAGE: ${error.message}\n${receivedFrom}`.red)
			return '{...' + key.slice(key.lastIndexOf('.') + 1) + '}'
		}
	}

	read(message, vars, lang) {
		if (!vars) vars = {}
		for (const key in vars) {
			if (typeof vars[key] === 'boolean') {
				if (vars[key] === false) {
					const regex = new RegExp(`\\{\\?${key}}.*\\{\\?${key}}`)
					message = message.replace(regex, '')
				}
				if (vars[key] === true) {
					const regex = new RegExp(`\\{!${key}}.*\\{!${key}}`)
					message = message.replace(regex, '')
				}
				message = message.replace(new RegExp(`\\{\\?${key}}`, 'g'), '')
				message = message.replace(new RegExp(`\\{!${key}}`, 'g'), '')
			}
			if (typeof vars[key] === 'string' && vars[key].startsWith('{%') && vars[key].endsWith('}')) {
				const keyify = vars[key].replace('{%', '').replace('}', '').split('.')
				let contentkey = this.get(lang)
				keyify.forEach(k => {
					contentkey = contentkey[k]
				})
				const oldvarkey = vars[key]
				vars[key] = contentkey
				if (!vars[key]) {
					const receivedFrom = new Error().stack.split('\n')[2].trim()
					console.log(`[LANGUAGE] An error occurred while trying to get the content of the key ${key + ': ' + oldvarkey} in the language ${lang}\n${receivedFrom}`.red)
					return '{...' + key.slice(key.lastIndexOf('.') + 1) + '}'
				}
			}
			message = message.replace(`{${key}}`, vars[key])
		}
		return message
	}

	test() {
		const description = '{?has_character}Selecione um personagem ({cleitin}) para visualizar seus dados{?has_character}\n{!has_character} Você não possui nenhum personagem{!has_character}'
		const example = this.setStrValues(description, { has_character: true, cleitin: 'cleitin rei delas' })
		return example
	}
}