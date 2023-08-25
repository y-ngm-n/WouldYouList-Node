const db = require("../config/database");


class Todo {

  // object -> database
  static #field = {
    "id": "id",
    "category": "category",
    "planDate": "date",
    "state": "state",
    "todoContent": "content",
    "todoName": "name",
    "user": "user",
    "reviewId": "review"
  };
  // database -> object
  static #prop = {
    "id": "id",
    "category": "category",
    "date": "planDate",
    "state": "state",
    "content": "todoContent",
    "name": "todoName",
    "user": "user",
    "review": "reviewId"
  };

  static async selectByOne(prop, value) {
    try {
      const query = `select * from todo where ${this.#field[prop]}=?;`;
      const result = await db.query(query, [value]);
      const datas = result[0];
      const todos = datas.map((data) => {
        const state = parseInt(data.state.toString("hex"));
        return {
          [this.#prop.id]: data.id,
          [this.#prop.category]: data.category,
          [this.#prop.date]: data.date,
          [this.#prop.state]: state,
          [this.#prop.content]: data.content,
          [this.#prop.name]: data.name,
          [this.#prop.user]: data.user,
          [this.#prop.review]: data.review
        }
      });
      return todos;
    } catch(err) { return err; }
  }

  static async insert(todo) {
    try {
      const query = `insert into todo(category, date, state, content, name, user) value(?, ?, 0, ?, ?, ?);`;
      const result = await db.query(query, [todo[this.#prop.category], todo[this.#prop.date], todo[this.#prop.content], todo[this.#prop.name], todo[this.#prop.user]]);
      const id = result[0].insertId;
      return id;
    } catch(err) { return err; }
  }

  static async updateContentByOne(prop, value, todo) {
    try {
      const query = `update todo set category=?, date=?, content=?, name=? where ${this.#field[prop]}=?;`;
      await db.query(query, [todo[this.#prop.category], todo[this.#prop.date], todo[this.#prop.content], todo[this.#prop.name], value]);
    } catch(err) { return err; }
  }

  static async updateStateByOne(prop, value, state) {
    try {
      const query = `update todo set state=? where ${this.#field[prop]}=?;`;
      await db.query(query, [state, value]);
    } catch(err) { return err; }
  }

  static async updateReviewByOne(prop, value, reviewId) {
    try {
      const query = `update todo set review=? where ${this.#field[prop]}=?;`;
      await db.query(query, [reviewId, value]);
    } catch(err) { return err; }
  }

  static async deleteByOne(prop, value) {
    try {
      const query = `delete from todo where ${this.#field[prop]}=?;`;
      await db.query(query, [value]);
    } catch(err) { return err; }
  }

}


module.exports = Todo;