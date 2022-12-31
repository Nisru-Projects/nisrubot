module.exports = (client) => {

	client.knexDatabase.keys = []
	client.knexDatabase.raw('SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = \'public\'').then(async (res) => {
		for (const row of res.rows) {
			const primaryKey = await client.knexDatabase.raw(`SELECT a.attname 
            FROM   pg_index i JOIN   pg_attribute a ON a.attrelid = i.indrelid 
            AND a.attnum = ANY(i.indkey)
            WHERE  i.indrelid = '${row.table_name}'::regclass
            AND    i.indisprimary;`)
			if (primaryKey.rows[0].attname == 'id') primaryKey.rows[0].attname = 'discord_id'
			if (!client.knexDatabase.keys.find(keyobj => keyobj.key === `${row.table_name}.*`)) client.knexDatabase.keys.push({ key: `${row.table_name}.*`, primaryKey: primaryKey.rows[0].attname })
			client.knexDatabase.keys.push({ key: `${row.table_name}.${row.column_name}`, primaryKey: primaryKey.rows[0].attname })
		}
		client.knexDatabase.keys = client.knexDatabase.keys.sort((a, b) => {
			if (a.key < b.key) return -1
			if (a.key > b.key) return 1
			return 0
		})
		console.log(`[DATABASE] Loaded with ${client.knexDatabase.keys.length} keys`.green)
	})

}