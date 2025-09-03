export { handleGet, handleHead };

import ky from 'ky';
import {
    ProxyAgent
} from 'undici';
import fs from 'fs';

// --- Helper Functions ---

/**
 * Creates a ky instance with proxy settings if provided.
 * @param {object} options - Command options.
 * @param {string} [options.proxy] - Proxy URL.
 * @returns {import('ky').KyInstance} A ky instance.
 */
const createKyInstance = (options) => {
    const proxyUrl = options.proxy || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
    const kyOptions = {};

    if (proxyUrl) {
        console.error(`Using proxy: ${proxyUrl}`);
        kyOptions.dispatcher = new ProxyAgent(proxyUrl);
    }

    return ky.extend(kyOptions);
};

/**
 * Handles errors, prints them to stderr, and exits.
 * @param {Error} error - The error object.
 */
const handleError = async (error) => {
    if (error.response) {
        console.error(`Error: ${error.response.status} ${error.response.statusText}`);
        try {
            const errorBody = await error.response.text();
            console.error(errorBody);
        } catch (e) {
            console.error('Could not read error response body.');
        }
    } else {
        console.error('Error:', error.message);
    }
    process.exit(1);
};

// --- Command Handlers ---

const handleGet = async (url, options) => {
    const customKy = createKyInstance(options);
    try {
        const response = await customKy.get(url);
        const body = await response.text();

        if (options.output) {
            fs.writeFileSync(options.output, body);
            console.error(`Downloaded to ${options.output}`);
        } else {
            console.log(body);
        }
    } catch (error) {
        await handleError(error);
    }
};

const handleHead = async (url, options) => {
    const customKy = createKyInstance(options);
    try {
        const response = await customKy.head(url);
        // kyのResponseオブジェクトはhttpVersionプロパティを持たないため、表示を簡略化
        console.log(`HTTP ${response.status} ${response.statusText}`);
        for (const [key, value] of response.headers.entries()) {
            console.log(`${key}: ${value}`);
        }
    } catch (error) {
        await handleError(error);
    }
};
