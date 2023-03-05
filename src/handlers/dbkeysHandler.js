module.exports = (client, time) => {

	client.knexInstance.keys = []
	client.knexInstance.raw('SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = \'public\'').then(async (res) => {
		for (const row of res.rows) {
			const primaryKey = await client.knexInstance.raw(`SELECT a.attname 
            FROM   pg_index i JOIN   pg_attribute a ON a.attrelid = i.indrelid 
            AND a.attnum = ANY(i.indkey)
            WHERE  i.indrelid = '${row.table_name}'::regclass
            AND    i.indisprimary;`)
			if (primaryKey.rows[0].attname == 'id') primaryKey.rows[0].attname = 'discord_id'
			if (!client.knexInstance.keys.find(keyobj => keyobj.key === `${row.table_name}.*`)) client.knexInstance.keys.push({ key: `${row.table_name}.*`, primaryKey: primaryKey.rows[0].attname })
			client.knexInstance.keys.push({ key: `${row.table_name}.${row.column_name}`, primaryKey: primaryKey.rows[0].attname })
		}
		client.knexInstance.keys = client.knexInstance.keys.sort((a, b) => {
			if (a.key < b.key) return -1
			if (a.key > b.key) return 1
			return 0
		})

		return console.log(`[DATABASE] Loaded with ${client.knexInstance.keys.length} keys in ${(Date.now() - time) / 1000}s`.green)
	})

}