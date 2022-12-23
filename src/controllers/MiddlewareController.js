module.exports = class MiddlewareController {
    constructor(client, interaction) {
        this.client = client
        this.interaction = interaction
    }

    async checkUser() {
        if (!await this.client.db.select('*').from('users').where('discord_id', this.interaction.user.id).first()) {
            await this.client.db('users').insert({
                discord_id: this.interaction.user.id
            }).then(async () => {
                this.user = await this.client.db.select('*').from('users').where('discord_id', this.interaction.user.id).first()
                console.log(`[DATABASE] User ${this.interaction.user.id} created`.green)
            })
        }
    }

    async checkPermissions (cmdPermissions) {
        const user = this.user || await this.client.db.select('*').from('users').where('discord_id', this.interaction.user.id).first()
        const userPermissions = user.permissions
        return cmdPermissions.every(perm => userPermissions.includes(perm)) || userPermissions.includes("*")
    }

    async getCharacters ()  {
        const user = this.user || await this.client.db.select('characters', 'selected_character').from('users').where('discord_id', this.interaction.user.id).first()
        return {
            selected_character: user.characters == null ? undefined : user.selected_character,
            characters: user.characters == null ? [] : user.characters
        }
    }
}