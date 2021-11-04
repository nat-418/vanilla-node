import http       from 'http';
import url        from 'url';
import {open}     from 'lmdb-store';
import handleJSON from './handleJSON.js';
import users      from './users.js';

const PORT = 1222;
const db   = open({path: 'db'});

const route = (request, response, db, path, method) => {
  const routes = {
    '/api/users': {
      methods: {
        'DELETE': () => handleJSON(request, response, db, users.del),
        'GET':    () => getUsers(response, db),
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

