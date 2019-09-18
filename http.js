import HttpRequest from './core/HttpRequest';
import defaults from './defaults';
import { extend } from './helpers';

/**
 * Create an instance of HttpRequest
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {HttpRequest} A new instance of HttpRequest
 */
function createInstance(defaultConfig) {
	const instance = {};
	const context = new HttpRequest(defaultConfig);

	extend(instance, HttpRequest.prototype, context);

	return instance;
}

const http = createInstance(defaults);

export default http;
