module.exports = class DataController {
    constructor(knexDatabase, redisCache) {
        this.knexDatabase = knexDatabase
        this.redisCache = redisCache
    }

    updateCache(primaryValue, key) {
        const primaryKey = this.knexDatabase.select("column_name").from("information_schema.key_column_usage").where("table_name", key.split(".")[0]).andWhere("constraint_name", "PRIMARY").first()

        console.log('primary key of updateCache', primaryKey)
        
        const value = this.knexDatabase.select(key.split(".")[1]).from(key.split(".")[0]).where(primaryKey, primaryValue).first()
        
        console.log('value of updateCache', primaryKey)

        return this.redisCache.set(key, value)
    }

    query(query, params) {
        return this.knexDatabase.query(query, params)
    }

    
    get(primaryValue, key) {
        if (this.exists(key)) return this.get(key)
        return this.updateCache(key, primaryValue)
    }

    set(primaryValue, key, value) {
        return
    }

    delete(primaryValue, key) {
        return
    }

    validKey(key) {
        return this.knexDatabase.keys.includes(key)
    }

    exists(primaryValue, key) {
        if (!this.validKey(key)) return console.log(`[DATABASE] Invalid key ${key}`.red)
    }

    async test() {
        
        const res = await this.get("characters_geral.*")

        return res // { key: 'characters_geral.attributes', value: '["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"]' }

    }

}