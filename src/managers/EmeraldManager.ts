import axios from 'axios'

export default class EmeraldManager {

	emeraldtoken: string
	BASE_URL: string
	OWNER: string
	headers: { Authorization: string }

	constructor(emeraldtoken: string) {
		this.emeraldtoken = emeraldtoken
		this.BASE_URL = 'https://api.github.com'
		this.OWNER = 'Nisru-Projects'
		this.headers = {
			Authorization: `Bearer ${this.emeraldtoken}`,
		}
	}

	getRepo(repo: string) : any {
		return axios.get(`${this.BASE_URL}/repos/${this.OWNER}/${repo}`, {
			headers: this.headers,
		})
	}

	getFiles(repo: string, path = '') : any {
		return axios.get(`${this.BASE_URL}/repos/${this.OWNER}/${repo}/contents/${path}`, {
			headers: this.headers,
		})
	}

	getContent(download_url: string, data64 = false) : any {
		if (data64) {
			return axios.get(download_url, {
				headers: this.headers,
				responseType: 'arraybuffer',
				transformResponse: [(data: any) => Buffer.from(data, 'binary').toString('base64')],
			})
		}
		return axios.get(download_url, {
			headers: this.headers,
		})
	}

}