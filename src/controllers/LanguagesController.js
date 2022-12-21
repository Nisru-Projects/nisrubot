module.exports = class LanguagesController {

    constructor (lang) {
        this.lang = lang || "en-US";
    }

    setStrValues (message, vars) {
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

    debug () {
        const description = "{?has_character}Selecione um personagem ({cleitin}) para visualizar seus dados{?has_character}\n{!has_character} Você não possui nenhum personagem{!has_character}"
        const example = this.setStrValues(description, { has_character: true, cleitin: "cleitin rei delas" })
        return example // deve retornar: 'Selecione um personagem (cleitin rei delas) para visualizar seus dados'
    }
}