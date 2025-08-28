#!/usr/bin/env node

import ky from 'ky';
import { ProxyAgent } from 'undici';
import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

program
  .argument('<url>', 'URL to fetch')
  .option('-o, --output <file>', 'Write to file instead of stdout')
  .option('-p, --proxy <proxy_url>', 'Proxy URL (e.g. http://proxy.example.com:8080)')
  .option('-H, --head', 'Perform a HEAD request')
  .action(async (url, options) => {
    const proxyUrl = options.proxy || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

    const kyOptions = {};

    if (options.head) {
      kyOptions.method = 'head';
    }

    if (proxyUrl) {
      console.error(`Using proxy: ${proxyUrl}`);
      kyOptions.dispatcher = new ProxyAgent(proxyUrl);
    }

    try {
      const response = await ky(url, kyOptions);

      if (options.head) {
        console.log(`HTTP/${response.httpVersion} ${response.status} ${response.statusText}`);
        for (const [key, value] of response.headers.entries()) {
          console.log(`${key}: ${value}`);
        }
        return;
      }

      const body = await response.text();

      if (options.output) {
        fs.writeFileSync(options.output, body);
        console.error(`Downloaded to ${options.output}`);
      } else {
        console.log(body);
      }
    } catch (error) {
      if (error.response) {
        console.error(`Error: ${error.response.status} ${error.response.statusText}`);
        const errorBody = await error.response.text();
        console.error(errorBody);
      } else {
        console.error('Error:', error.message);
      }
      process.exit(1);
    }
  });

program.parse(process.argv);