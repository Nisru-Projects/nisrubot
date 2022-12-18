module.exports = class MiddlewareController {

    constructor(client, interaction) {
        this.client = client
        this.interaction = interaction
    }

    async checkPermissions (cmdPermissions) {
        const user = await this.client.db.select('*').from('users').where('discord_id', this.interaction.user.id).first()
        const userPermissions = user.permissions
        return cmdPermissions.every(perm => userPermissions.includes(perm)) || userPermissions.includes("*")
    }

    async getCharacters ()  {
        const user = await this.client.db.select('characters', 'selected_character').from('users').where('discord_id', this.interaction.user.id).first()
        return user.characters == null ? false : {
            selected_character: user.selected_character,
            characters: user.characters
        }
    }
}