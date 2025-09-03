#!/usr/bin/env node

import { Command } from 'commander';
import {
  createRequire
} from 'module';
import {
  handleGet,
  handleHead
} from './src/lib/handlles.js';


const program = new Command();
const require = createRequire(
  import.meta.url);
const {
  version
} = require('./package.json');

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