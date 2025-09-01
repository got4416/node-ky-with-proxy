#!/usr/bin/env node

import ky from 'ky';
import {
  ProxyAgent
} from 'undici';
import { Command } from 'commander';
import fs from 'fs';
import {
  createRequire
} from 'module';

const program = new Command();
const require = createRequire(
  import.meta.url);
const {
  version
} = require('./package.json');

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
    console.log(`HTTP/${response.httpVersion} ${response.status} ${response.statusText}`);
    for (const [key, value] of response.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
  } catch (error) {
    await handleError(error);
  }
};

// --- Command Definitions ---

program
  .version(version)
  .description('A command-line HTTP(S) client using ky.');

// Function to add common options to a command
const addCommonOptions = (command) => {
  return command.option('-p, --proxy <proxy_url>', 'Proxy URL (e.g. http://proxy.example.com:8080)');
};

// GET command (default)
const getCommand = program
  .command('get', { isDefault: true })
  .description('Perform a GET request (default).')
  .argument('<url>', 'URL to fetch')
  .option('-o, --output <file>', 'Write to file instead of stdout');

addCommonOptions(getCommand).action(handleGet);

// HEAD command
const headCommand = program
  .command('head')
  .description('Perform a HEAD request.')
  .argument('<url>', 'URL to fetch');

addCommonOptions(headCommand).action(handleHead);

program.parse(process.argv);