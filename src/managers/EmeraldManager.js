const axios = require('axios')

module.exports = class EmeraldManager {
	constructor(emeraldtoken) {
		this.emeraldtoken = emeraldtoken
		this.BASE_URL = ' https://api.github.com'
		this.OWNER = 'Nisru-Projects'
		this.headers = {
			Authorization: `Bearer ${this.emeraldtoken}`,
		}
	}

	getRepo(repo) {
		return axios.get(`${this.BASE_URL}/repos/${this.OWNER}/${repo}`, {
			headers: this.headers,
		})
	}

	getFiles(repo, path = '') {
		return axios.get(`${this.BASE_URL}/repos/${this.OWNER}/${repo}/contents/${path}`, {
			headers: this.headers,
		})
	}

	getContent(download_url) {
		return axios.get(download_url, {
			headers: this.headers,
		})
	}

}