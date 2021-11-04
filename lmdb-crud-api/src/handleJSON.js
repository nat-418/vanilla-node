/** @module handleJSON */
import {badRequest} from './replies.js';

/**
 * Read JSON data submitted in e.g. a POST request.
 *
 * @param {object}   request  - Node HTTP request object
 * @param {object}   response - Node HTTP response object
 * @param {object}   db       - LMDB object
 * @param {function} callback - Some function to run once data is ready
 * @returns {void}   Side-effect: serve some resource
 */
const handleJSON = (request, response, db, callback) => {
  const chunks = [];

  request.on('data', chunk => {
    if (chunk.length > 100000) {
      console.error(
        new Date(),
        "Request body chunk too large:\n",
        chunk.length
      );
      badRequest(response);
    }
    chunks.push(chunk)
  });

  request.on('end', () => {
    try {
      JSON.parse(Buffer.concat(chunks));
    } catch (error) {
      console.error(
        new Date(),
        "JSON parsing failed:\n",
        JSON.stringify(chunks)
      );

      badRequest(response);

      return false;
    }

    const body = JSON.parse(Buffer.concat(chunks).toString());

    callback(response, db, body);
  });
};

export default handleJSON;
