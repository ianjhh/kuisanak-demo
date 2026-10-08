import axios, { AxiosError } from 'axios';
import { handle } from './offline/server';

// The pages call the API with axios, as in the full-stack version. Here axios's
// network layer (its "adapter") is replaced by the in-browser API in
// offline/server.js, so every request is answered without leaving the page.
function offlineAdapter(config) {
    let body = config.data;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            body = {};
        }
    }
    const { status, data } = handle((config.method || 'get').toLowerCase(), config.url, body || {});
    const response = { data, status, statusText: String(status), headers: {}, config, request: null };
    if (config.validateStatus ? config.validateStatus(status) : status >= 200 && status < 300) {
        return Promise.resolve(response);
    }
    return Promise.reject(new AxiosError(
        `Request failed with status code ${status}`,
        status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
        config, null, response,
    ));
}

export function configureApi() {
    axios.defaults.adapter = offlineAdapter;
}
