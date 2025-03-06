const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || '';

export default class SweetLatexApiClient {
    constructor(onError) {
        this.onError = onError;
        this.base_url = BASE_API_URL + '/api';
        this.image_path = BASE_API_URL + '/api/media/';
    }

    async request(options) {
        let response = await this.requestInternal(options);
        if (response.status === 401 && options.url !== '/tokens') {
            const refreshResponse = await this.put('/tokens', {
                access_token: localStorage.getItem('accessToken'),
            });
            if (refreshResponse.ok) {
                localStorage.setItem('accessToken', refreshResponse.body.access_token);
                response = await this.requestInternal(options);
            }
        }
        if (response.status >= 500 && this.onError) {
            this.onError(response);
        }
        return response;
    }

    async requestInternal(options) {
        let optionHeader;
        if (options.type === 'form') {
            // No Content-Type for FormData, let the browser handle it
            optionHeader = {
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
                ...options.headers
            };
        } else {
            optionHeader = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
                ...options.headers
            };
        }

        let query = new URLSearchParams(options.query || {}).toString();
        if (query !== '') {
            query = '?' + query;
        }

        let response;
        try {
            let body = null;
            if (options.body) {
                if (options.type === 'form') {
                    body = options.body; // For 'form' type, use FormData as is
                } else {
                    body = JSON.stringify(options.body); // Stringify for JSON type
                }
            }

            response = await fetch(this.base_url + options.url + query, {
                method: options.method,
                headers: optionHeader,
                credentials: options.url === '/tokens' ? 'include' : 'omit',
                body: body,
            });
        } catch (error) {
            response = {
                ok: false,
                status: 500,
                json: async () => {
                    return {
                        code: 500,
                        message: 'The server is unresponsive',
                        description: error.toString(),
                    };
                }
            };
        }

        return {
            ok: response.ok,
            status: response.status,
            body: response.status !== 204 ? await response.json() : null
        };
    }


    async get(url, query, options) {
        return this.request({ method: 'GET', url, query, ...options });
    }

    async post(url, body, options) {
        return this.request({ method: 'POST', url, body, ...options });
    }

    async put(url, body, options) {
        return this.request({ method: 'PUT', url, body, ...options });
    }

    async delete(url, options) {
        return this.request({ method: 'DELETE', url, ...options });
    }

    async login(username, password) {
        const response = await this.post('/tokens', null, {
            headers: {
                Authorization: 'Basic ' + btoa(username + ":" + password)
            }
        });
        if (!response.ok) {
            return response.status === 401 ? 'fail' : 'error';
        }
        localStorage.setItem('accessToken', response.body.access_token);
        return 'ok';
    }

    async logout() {
        await this.delete('/tokens');
        localStorage.removeItem('accessToken');
    }

    isAuthenticated() {
        return localStorage.getItem('accessToken') !== null;
    }
}
