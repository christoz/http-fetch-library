import defaults from '../defaults';
import { handleJSON, handleError } from '../jsonHandlers';
import { createRequestURI, amendOptions } from '../helpers';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Create a new instance of HttpRequest
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function HttpRequest(instanceConfig) {
	this.defaults = instanceConfig;
}

HttpRequest.prototype.request = function(url, config) {
	config = Object.assign({}, this.defaults, { method: 'get' }, config);

	return fetch(url, config)
		.then(handleJSON)
		.then(response => {
			if (isDev) {
				console.info(
					'Requesting: %o\n- Headers: %s\n- Body: %s\n ** Result: %o',
					url,
					JSON.stringify(config.headers),
					JSON.stringify(config.body),
					response
				);
			}

			return response;
		})
		.then(handleError);
};

['get', 'delete'].forEach(method => {
	HttpRequest.prototype[method] = function(url, config) {
		const uri = createRequestURI(url);
		const options = {
			method
		};

		return this.request(uri, options);
	};
});

['post', 'put', 'patch'].forEach(method => {
	HttpRequest.prototype[method] = function(url, body, config, isForm) {
		const uri = createRequestURI(url);
		const amendedOptions = amendOptions(method, isForm, body, defaults);

		const options = {
			method,
			...amendedOptions
		};

		return this.request(uri, options);
	};
});

export default HttpRequest;
