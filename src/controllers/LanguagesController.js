const fs = require('fs')
const path = require('path')
module.exports = class LanguagesController {
	constructor(lang) {
		this.lang = lang || 'pt-BR'
	}

	set(name, lang) {
		this[name] = lang
	}

	get(lang) {
		return this[lang]
	}

	load(folder = './resources/languages') {
		if (!fs.existsSync(folder)) {
			console.log(`[LANGUAGE] The folder ${folder} does not exist`.red)
			return process.exit(1)
		}
		const files = fs.readdirSync(path.resolve(folder))
		files.forEach(file => {
			const lang = require(path.resolve(folder, file))
			this.set(lang.name, lang)
			if (files.length === 1) {
				this.lang = lang.name
			}
		})
		if (files.length === 0) {
			console.log(`[LANGUAGE] No languages found in the folder ${folder}`.red)
			return process.exit(1)
		}
		console.log(`[LANGUAGE] Loaded ${files.length} languages`.green)
	}

	content(key, vars, lang = this.lang) {
		try {
			if (!this.get(lang)) return 'Language not found'
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
			return this.read(contentkey, vars)
		}
		catch (error) {
			console.log(`[LANGUAGE] An error occurred while trying to get the content of the key ${key} in the language ${lang}\nERROR MESSAGE: ${error.message}`.red)
			return key.slice(key.lastIndexOf('.') + 1)
		}
	}

	read(message, vars) {
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
				let contentkey = this.get(this.lang)
				keyify.forEach(k => {
					contentkey = contentkey[k]
				})
				vars[key] = contentkey
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