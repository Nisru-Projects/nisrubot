module.exports = class BaseCommand {
    constructor(client, options) {
        this.client = client,
        this.name = options.name || null,
        this.description = options.description || "No description.",
        this.options = options.options || undefined,
        this.permissions = options.permissions || []
    }
}