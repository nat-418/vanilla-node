import {ok, badRequest} from './replies.js';

const validate = users => {
  return users.every(user => {
       user.username !== undefined
    && user.password !== undefined
  });
};

const get = async (response, db) => {
  const users = await db.get('users');
  ok(response, JSON.stringify(users), 'application/json');
};

const set = async (response, db, users) => {
  if (!validate(users)) {
    badRequest(response);
  }

  await db.put('users', users);

  ok(response, JSON.stringify(await db.get('users')), 'application/json');
};

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
