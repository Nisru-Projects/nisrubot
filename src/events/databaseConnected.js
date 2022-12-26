module.exports = {
    name: "databaseConnected",
    execute: async(client) => {
        client.db.keys = []
        client.db.raw('SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = \'public\'').then(async (res) => {
            for (const row of res.rows) {
                if (!client.db.keys.includes(`${row.table_name}.*`)) client.db.keys.push(`${row.table_name}.*`)
                client.db.keys.push(`${row.table_name}.${row.column_name}`)
            }
            client.db.keys = client.db.keys.sort()
            console.log(`[DATABASE] Loaded with ${client.db.keys.length} keys`.green)
        })

    }
}