export const handleJSON = response => {
	let result = null;

	try {
		result = response.json();
	} catch (err) {
		// eslint-disable-next-line no-unused-vars
		const str = response._bodyText.toLowerCase();
		console.error('Could no parse json: ', response._bodyText);
	}

	return result;
};

export const handleError = response => {
	const succesCodes = [200, 201];

	if (succesCodes.includes(response.code)) {
		return Promise.resolve(response);
	}

	return Promise.reject(response);
};
