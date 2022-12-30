module.exports = (client) => {

	client.db.keys = []
	client.db.raw('SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = \'public\'').then(async (res) => {
		for (const row of res.rows) {
			const primaryKey = await client.db.raw(`SELECT a.attname 
            FROM   pg_index i JOIN   pg_attribute a ON a.attrelid = i.indrelid 
            AND a.attnum = ANY(i.indkey)
            WHERE  i.indrelid = '${row.table_name}'::regclass
            AND    i.indisprimary;`)
			if (!client.db.keys.find(keyobj => keyobj.key === `${row.table_name}.*`)) client.db.keys.push({ key: `${row.table_name}.*`, primaryKey: primaryKey.rows[0].attname })
			client.db.keys.push({ key: `${row.table_name}.${row.column_name}`, primaryKey: primaryKey.rows[0].attname })
		}
		client.db.keys = client.db.keys.sort((a, b) => {
			if (a.key < b.key) return -1
			if (a.key > b.key) return 1
			return 0
		})
		console.log(`[DATABASE] Loaded with ${client.db.keys.length} keys`.green)
	})

}