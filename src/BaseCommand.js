class BaseCommand {
    constructor(client, options) {
        this.client = client,
        this.name = options.name || null,
        this.description = options.description || "Sem descrição.",
        this.options = options.options || undefined
    }
}

module.exports = BaseCommand;