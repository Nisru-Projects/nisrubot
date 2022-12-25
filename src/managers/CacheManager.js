module.exports = class CacheManager {
    constructor(client) {
        this.client = client;
    }

    connect() {
        return client.connect()
    }

    clear() {
        return client.flushAll()
    }

    set(key, value) {
        return client.set(key, value)
    }

    get(key) {
        return client.get(key)
    }

    delete(key) {
        return client.del(key)
    }

    exists(key) {
        return client.exists(key)
    }
}
