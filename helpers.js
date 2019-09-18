/**
 * Creates a valid uri for requests within domain
 * If url has http|https we handle it as a fixed outbound url and we return it as it is.
 * @param {String} url
 * @returns {String} requestURI
 */
export function createRequestURI(url) {
	const baseURI = window.location.protocol + '//' + window.location.host;
	const pattern = /^(http|https)/;
	let requestURI;

	if (pattern.test(url)) {
		requestURI = url;
	} else {
		requestURI = `${baseURI}${url}`;
	}

	return requestURI;
}

/**
 * Helper function that ensures body is stringified
 * @param {Object|String} body
 * @returns {String}
 */
export function prepareRequestBody(body) {
	switch (typeof body) {
		case 'string':
			return body;
		default:
			return JSON.stringify(body);
	}
}

export function getCSRFToken() {
	const token = document.head.querySelector('meta[name="csrf-token"]');

	if (!token) {
		console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');

		return null;
	}

	return {
		'X-CSRF-TOKEN': token.content
	};
}

/**
 * Converts body to form data for form submissions.
 * If body attribute is object it flattens it and creates a new entry with a key format as parentKey_key
 * Supports POST and PUT request for url encoded form data
 * @param {JSON} request
 * @param {FormData|Object} inFormData
 * @param {String} parentKey
 * @param {String} method
 * @returns {FormData|Object} formData, if method is set to PUT formData will be returned as urlEncoded
 */
function prepareFormDataBody(JSON, inFormData = null, parentKey = null, method = 'post') {
	const formData = inFormData || (method === 'post' ? new FormData() : {});

	for (let key in JSON) {
		let constructedKey = key;
		if (parentKey) {
			constructedKey = parentKey + '_' + key;
		}

		const value = JSON[key];
		// Append data only if the value is not a json object else do recursion
		if (value && value.constructor === {}.constructor) {
			prepareFormDataBody(value, formData, constructedKey, method);
		} else {
			if (method === 'post') {
				formData.append(constructedKey, JSON[key]);
			} else {
				Object.assign(formData, { [constructedKey]: JSON[key] });
			}
		}
	}

	return formData;
}

export function amendOptions(method, isForm, body, defaults) {
	if (isForm) {
		const headers = defaults.headers;
		delete headers['Content-Type'];

		if (method === 'put') {
			return {
				headers: {
					...headers,
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				body: new URLSearchParams(prepareFormDataBody(body, null, null, method))
			};
		}

		return {
			headers,
			body: prepareFormDataBody(body)
		};
	}

	return {
		headers: defaults.headers,
		body
	};
}

export function bind(fn, thisArg) {
	return function wrap() {
		const args = new Array(arguments.length);
		for (let i = 0; i < args.length; i++) {
			args[i] = arguments[i];
		}
		return fn.apply(thisArg, args);
	};
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
export function extend(a, b, thisArg) {
	forEach(b, function assignValue(val, key) {
		if (thisArg && typeof val === 'function') {
			a[key] = bind(val, thisArg);
		} else {
			a[key] = val;
		}
	});
	return a;
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
	// Don't bother if no value provided
	if (obj === null || typeof obj === 'undefined') {
		return;
	}

	// Force an array if not already something iterable
	if (typeof obj !== 'object') {
		/*eslint no-param-reassign:0*/
		obj = [obj];
	}

	if (Array.isArray(obj)) {
		// Iterate over array values
		for (let i = 0, l = obj.length; i < l; i++) {
			fn.call(null, obj[i], i, obj);
		}
	} else {
		// Iterate over object keys
		for (let key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				fn.call(null, obj[key], key, obj);
			}
		}
	}
}
