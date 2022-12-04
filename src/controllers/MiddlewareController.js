module.exports = class MiddlewareController {

    constructor(client, interaction) {
        this.client = client
        this.interaction = interaction
    }

    async checkPermissions (cmdPermissions, client = this.client, interaction = this.interaction) {
        const user = await client.db.select('*').from('users').where('discord_id', interaction.user.id).first()
        const userPermissions = user.permissions
        return cmdPermissions.every(perm => userPermissions.includes(perm)) || userPermissions.includes("*")
    }

    async checkCharacter ()  {

    }
}