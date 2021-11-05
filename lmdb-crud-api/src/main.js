/** @module Main */

import http       from 'http';
import url        from 'url';
import {open}     from 'lmdb-store';
import handleJSON from './handle-json.js';
import users      from './users.js';

const PORT = 1222;
const db   = open({path: 'db'});

/**
 * Match requests and responses.
 *
 * @param {http.IncomingMessage} request  - Node HTTP request object
 * @param {http.ServerResponse}  response - Node HTTP request object
 * @param {object}               db       - LMDB object
 * @param {string} path                   - Path to the requested resource
 * @param {string} method                 - HTTP request method (verb)
 * @returns {void} Side-effect: serve resource
 */
const route = (request, response, db, path, method) => {
  const routes = {
    '/api/users': {
      methods: {
        'DELETE': () => handleJSON(request, response, db, users.del),
        'GET':    () => users.get(response, db),
        'HEAD':   () => {
          response.writeHead(200, 'OK');
          response.end();
        },
        'OPTIONS': () => {
          const allowed = Object.keys(routes['/api/users'].methods).join(', ');
          response.writeHead(200, 'OK', {'Allow': allowed});
          response.end();
        },
        'PATCH': () => handleJSON(request, response, db, users.mod),
        'POST':  () => handleJSON(request, response, db, users.add),
        'PUT':   () => handleJSON(request, response, db, users.set)
      }
    }
  };

  if (!Object.keys(routes).includes(path)) {
    response.writeHead(404, 'Not Found');
    response.end();
    return false;
  }

  if (!Object.keys(routes[path].methods).includes(method)) {
    response.writeHead(405, 'Method Not Allowed');
    response.end();
    return false;
  }

  return routes[path].methods[method]();
};

http.createServer((request, response) => {
  const now       = new Date();
  const parsedURL = url.parse(request.url, true);

  console.log(now.toISOString(), parsedURL.path, request.method);

  route(request, response, db, parsedURL.path, request.method);
}).listen(PORT);

