/** @module Users */
import {ok, badRequest} from './replies.js';

/**
 * @typedef  {object} User
 * @property {string} username
 * @property {string} password
 */

/**
 * Verify that submitted data is well-formed.
 *
 * @private
 * @param {User[]} users - Data to be verified
 * @returns {boolean} Is the data good?
 */
const validate = users => {
  return users.every(user => {
       user.username !== undefined
    && user.password !== undefined
  });
};

/**
 * Read the users table.
 *
 * @async
 * @param {object} response - Node HTTP response object
 * @param {object} db       - LMDB object
 * @returns {Promise<void>} Side-effect: serve users JSON
 */
const get = async (response, db) => {
  const users = await db.get('users');
  ok(response, JSON.stringify(users), 'application/json');
};

/**
 * Define the users table.
 *
 * @async
 * @param {object} response - Node HTTP response object
 * @param {object} db       - LMDB object
 * @param {User[]} users    - Users table
 * @returns {Promise<void>} Side-effect: serve users JSON
 */
const set = async (response, db, users) => {
  if (!validate(users)) {
    badRequest(response);
  }

  await db.put('users', users);

  ok(response, JSON.stringify(await db.get('users')), 'application/json');
};

/**
 * Append to the users table.
 *
 * @async
 * @param {object} response - Node HTTP response object
 * @param {object} db       - LMDB object
 * @param {User[]} users    - Users table
 * @returns {Promise<void>} Side-effect: serve users JSON
 */
const add = async (response, db, users) => {
  if (!validate(users)) {
    badRequest(response);
  }

  const existing = await db.get('users');

  const newUsers = users.filter(user => {
    return !existing.find(({username}) => username === user.username);
  });

  await db.put('users', [...existing, ...newUsers]);

  ok(response, JSON.stringify(await db.get('users')), 'application/json');
};

/**
 * Modify the users table.
 *
 * @async
 * @param {object} response - Node HTTP response object
 * @param {object} db       - LMDB object
 * @param {User[]} users    - Users table
 * @returns {Promise<void>} Side-effect: serve users JSON
 */
const mod = async (response, db, users) => {
  if (!validate(users)) {
    badRequest(response);
  }

  const existing = await db.get('users');

  const updated = existing.map(exists => {
    if (users.find(user => user.username === exists.username)) {
      return users.find(user => user.username === exists.username);
    }
    return exists;
  });

  await db.put('users', updated);

  ok(response, JSON.stringify(await db.get('users')), 'application/json');
};

/**
 * Delete from the users table.
 *
 * @async
 * @param {object} response - Node HTTP response object
 * @param {object} db       - LMDB object
 * @param {User[]} users    - Users table
 * @returns {Promise<void>} Side-effect: serve users JSON
 */
const del = async (response, db, users) => {
  if (!validate(users)) {
    badRequest(response);
  }

  const existing = await db.get('users');

  const updated = existing.filter(user => {
    return !users.find(({username}) => username === user.username);
  });

  await db.put('users', updated);

  ok(response, JSON.stringify(await db.get('users')), 'application/json');
};

export default {add, del, get, mod, set}
