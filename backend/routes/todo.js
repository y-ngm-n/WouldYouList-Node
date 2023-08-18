const express = require("express");

const db = require("../config/database");


const router = express.Router();

router.get("/todo", async (req, res, next) => {
  try {
    const query = "select * from todo where state=0";
    const result = await db.query(query);
    const todos = result[0];
    todos.forEach((todo) => {
      const state = todo.state.toString("hex");
      todo.state = parseInt(state);
    });
    res.status(200).json(todos);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.get("/doneTodo", async (req, res, next) => {
  try {
    const query = "select * from todo where state=1";
    const result = await db.query(query);
    const todos = result[0];
    todos.forEach((todo) => {
      const state = todo.state.toString("hex");
      todo.state = parseInt(state);
    });
    res.status(200).json(todos);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.post("/todo/new", async (req, res, next) => {
  try {
    const todo = req.body;
    const query = "insert into todo(user, state, planDate, todoName, category, todoContent) value(?, 0, ?, ?, ?, ?);";
    const result = await db.query(query, [todo.user, todo.planDate, todo.todoName, todo.category, todo.todoContent]);
    const id = result[0].insertId
    res.status(200).json({ id });
  } catch(err) {
    console.error(err);
    next(err);
  }
});


module.exports = router;