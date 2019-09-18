import { getCSRFToken } from './helpers';

const defaults = {
	headers: {
		'Content-Type': 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
		'X-User-Agent': process.env.USER_AGENT,
		...getCSRFToken()
	}
};

export default defaults;
