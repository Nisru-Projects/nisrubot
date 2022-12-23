const fs = require("fs")
const path = require("path")
module.exports = class LanguagesController {

    constructor (lang) {
        this.lang = lang || "pt-BR"
    }

    set (name, lang) {
        this[name] = lang
    }

    get (lang) {
        return this[lang]
    }

    load (folder = "./languages") {
        const files = fs.readdirSync(path.resolve(folder))
        files.forEach(file => {
            const lang = require(path.resolve(folder, file))
            this.set(lang.name, lang)
            console.log(`[LANGUAGE] Loaded ${lang.name}`.green)
        })
    }

    content (key, vars, lang = this.lang) {
        const keyify = key.split(".")
        let contentkey = this.get(lang)
        keyify.forEach(k => {
            contentkey = contentkey[k]
        })
        return this.read(contentkey, vars)
    }

    read (message, vars) {
        if (!vars) vars = {}
        for (const key in vars) {
            if (typeof vars[key] === "boolean") {
                if (vars[key] === false) {
                    const regex = new RegExp(`\\{\\?${key}}.*\\{\\?${key}}`)
                    message = message.replace(regex, "")
                }
                if (vars[key] === true) {
                    const regex = new RegExp(`\\{!${key}}.*\\{!${key}}`)
                    message = message.replace(regex, "")
                }
                message = message.replace(new RegExp(`\\{\\?${key}}`, "g"), "")
                message = message.replace(new RegExp(`\\{!${key}}`, "g"), "")
            }
            message = message.replace(`{${key}}`, vars[key])
        }
        return message
    }

    test () {
        const description = "{?has_character}Selecione um personagem ({cleitin}) para visualizar seus dados{?has_character}\n{!has_character} Você não possui nenhum personagem{!has_character}"
        const example = this.setStrValues(description, { has_character: true, cleitin: "cleitin rei delas" })
        return example // deve retornar: 'Selecione um personagem (cleitin rei delas) para visualizar seus dados'
    }
}