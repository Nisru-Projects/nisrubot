type LanguageName = string
type LanguageContent = object | any
type LanguageKey = string

type Language = {
	name: LanguageName
	content: LanguageContent
}

export default class LanguagesController {

	default_language: LanguageName = 'pt-BR'
	languages: Language[] = []

	constructor(languageName: LanguageName) {
		this.default_language = languageName || 'pt-BR'
	}

	set(languageName: LanguageName, languageContent: LanguageContent) {
		this.languages.push({ name: languageName, content: languageContent })
	}

	get(languageName: LanguageName) : LanguageContent {
		const language = this.languages.find(language => language.name == languageName)
		if (!language) {
			const receivedFrom = new Error().stack?.split('\n')[2].trim()
			console.log(`[LANGUAGE] Language ${languageName} not found\n${receivedFrom}`.red)
			return process.exit(1)
		}
		return language.content
	}

	add(lang: LanguageContent) {
		this.set(lang.name, lang)
	}

	getCommandKey(translatedCommand: string, languageName = this.default_language) {
		const keys = Object.keys(this.get(languageName).commands)

		for (const key of keys) {
			if (this.get(languageName).commands[key].name == translatedCommand) {
				return key
			}
		}

		return translatedCommand
	}


	content(key: LanguageKey, vars: any, languageName = this.default_language) : string {
		try {
			let contentkey = this.get(languageName)

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
			return this.read(contentkey, vars, languageName)
		}
		catch (error: any) {
			if (vars && vars.undefined) {
				return this.content(vars.undefined, vars, languageName)
			}
			const receivedFrom = new Error().stack?.split('\n')[2].trim()
			console.log(`[LANGUAGE] An error occurred while trying to get the content of the key ${key} in the language ${languageName}\nERROR MESSAGE: ${error.message}\n${receivedFrom}`.red)
			return '{...' + key.slice(key.lastIndexOf('.') + 1) + '}'
		}
	}

	read(message: string, vars: any, lang: LanguageName) : string {
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
				keyify.forEach((k: string | number) => {
					contentkey = contentkey[k]
				})
				const oldvarkey = vars[key]
				vars[key] = contentkey
				if (!vars[key]) {
					const receivedFrom = new Error().stack?.split('\n')[2].trim()
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
		const example = this.content(description, { has_character: true, cleitin: 'cleitin rei delas' })
		return example
	}
}