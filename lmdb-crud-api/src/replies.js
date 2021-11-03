const ok = (response, body, mimetype) => {
  response.writeHead(200, 'OK', {'Content-Type': mimetype});
  response.end(body, 'UTF-8');
};

const badRequest = response => {
  response.writeHead(400, 'Bad Request');
  response.end();
};

export {ok, badRequest};
