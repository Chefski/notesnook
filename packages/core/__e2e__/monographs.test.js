/*
This file is part of the Notesnook project (https://notesnook.com/)

Copyright (C) 2022 Streetwriters (Private) Limited

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { databaseTest, noteTest, StorageInterface } from "../__tests__/utils";

const user = {
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
  hashedPassword: process.env.HASHED_PASSWORD
};

jest.setTimeout(15 * 1000);

beforeEach(() => {
  StorageInterface.clear();
});

afterAll(async () => {
  const db = await databaseTest();
  await db.monographs.init();

  for (const id of db.monographs.monographs) {
    await db.monographs.unpublish(id);
  }

  StorageInterface.clear();
});

// test("get monographs", () =>
//   databaseTest().then(async (db) => {
//     await db.user.login(user.email, user.password, user.hashedPassword);

//     await db.monographs.init();

//     expect(db.monographs.all).toBeGreaterThanOrEqual(0);
//   }));

test("publish a monograph", () =>
  noteTest().then(async ({ db, id }) => {
    await db.user.login(user.email, user.password, user.hashedPassword);
    await db.monographs.init();

    const monographId = await db.monographs.publish(id);

    expect(db.monographs.all.find((m) => m.id === id)).toBeDefined();

    const monograph = await db.monographs.get(monographId);
    const note = db.notes.note(id);
    expect(monograph.id).toBe(monographId);
    expect(monograph.title).toBe(note.title);
  }));

test("update a published monograph", () =>
  noteTest().then(async ({ db, id }) => {
    await db.user.login(user.email, user.password, user.hashedPassword);
    await db.monographs.init();

    const monographId = await db.monographs.publish(id);
    let monograph = await db.monographs.get(monographId);
    const note = db.notes.note(id);
    expect(monograph.title).toBe(note.title);

    const editedTitle = "EDITED TITLE OF MY NOTE!";
    await db.notes.add({ id, title: editedTitle });
    await db.monographs.publish(id);
    monograph = await db.monographs.get(monographId);
    expect(monograph.title).toBe(editedTitle);
  }));

test("unpublish a monograph", () =>
  noteTest().then(async ({ db, id }) => {
    await db.user.login(user.email, user.password, user.hashedPassword);
    await db.monographs.init();

    await db.monographs.publish(id);
    expect(db.monographs.all.find((m) => m.id === id)).toBeDefined();

    await db.monographs.unpublish(id);
    expect(db.monographs.all.find((m) => m.id === id)).toBeUndefined();
  }));
