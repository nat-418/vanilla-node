/** @module Replies */

/**
 * Standard, all-is-well HTTP response.
 *
 * @param {object} response - Node HTTP response object
 * @param {string} body     - HTTP response body
 * @param {string} mimetype - HTTP response body MIME type
 * @returns {void} Side-effect: serve resource
 */
const ok = (response, body, mimetype) => {
  response.writeHead(200, 'OK', {'Content-Type': mimetype});
  response.end(body, 'UTF-8');
};

/**
 * Refuse a malformed or objectionable request.
 *
 * @param {object} response - Node HTTP response object
 * @returns {void} Side-effect: send HTTP response
 */
const badRequest = response => {
  response.writeHead(400, 'Bad Request');
  response.end();
};

export {ok, badRequest};
