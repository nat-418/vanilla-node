#!/usr/bin/env node
import http     from 'http';
import https    from 'https';
// Recommended options parser by Node official documentation.
import minimist from 'minimist';
import {URL}    from 'url';

const {DEBUG}               = process.env;
const [node, path, ...rest] = process.argv;
const args                  = minimist(rest);

if (DEBUG) {
  const now       = new Date();
  const timestamp = now.toISOString();

  console.log('# Debug information:');
  console.table({
    args: JSON.stringify(args),
    node,
    path,
    timestamp
  });
  console.log('');
}

// This example does not implement HTTP methods that have a body.
const implementedMethods = ["GET", "HEAD", "TRACE", "OPTIONS"];

const helpMessage = `
  --help    -h print this help message
  --method  -m HTTP request method
  --url     -u the target resource
  --verbose -v print http headers
  --version    print version information
`.trimEnd();

if (args.help || args.h) {
  console.log(helpMessage);
  process.exit(0);
}

// Check long option flag, then short, then first input.
const url = args.url || args.u || args._[0];

// This bit of imperative mutation handles bad URL input.
/** @type {null|URL} */
let parsedURL = null;

try {
  parsedURL = new URL(url);
} catch (error) {
  console.error("Error! Bad URL given:", parsedURL);
  if (DEBUG) {
    console.error(error);
  }
  process.exit(1);
}

// Which Node module do we need, TLS or not?
const protocols = {'http:': http, 'https:': https};

/** @type {http|https} */
const protocol  = protocols[parsedURL.protocol];

const options = {
  hostname: parsedURL.hostname,
  method:   (args.method || args.m || 'GET').toUpperCase(),
  path:     parsedURL.path,
  port:     parsedURL.port
};

if (!implementedMethods.includes(options.method)) {
  console.error('Error! Request method is not impelmented:', options.method);
  process.exit(1);
}

/** @type {boolean} */
const showHeader = args.verbose
                   || args.v
                   || options.method === 'HEAD'
                   || options.method === 'OPTIONS'
                   || options.method === 'TRACE';

const request = protocol.request(options, response => {
  if (showHeader) {
    console.log('# Response headers:');
    console.table(response.headers);
    console.log('');
  }
  response.on('data', data => {
    process.stdout.write(data);
  });
});

request.on('error', error => {
  console.error(error);
});

request.end();
