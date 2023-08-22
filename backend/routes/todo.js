// imports
const express = require("express");
const db = require("../config/database");

// vars
const router = express.Router();


// routers
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

router.put("/todo/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const todo = req.body;
    const query = "update todo set planDate=?, todoName=?, category=?, todoContent=? where id=?;";
    await db.query(query, [todo.planDate, todo.todoName, todo.category, todo.todoContent, id]);
    res.status(200).json({ id, user: "?" });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.put("/todo/:id/toggle", async (req, res, next) => {
  try {
    const id = req.params.id;
    const selectQuery = "select * from todo where id=?;";
    const result = await db.query(selectQuery, [id]);
    const state = parseInt(result[0][0].state.toString("hex"));
    let newState;
    if (state) newState = 0;
    else newState = 1;
    const updateQuery = "update todo set state=? where id=?;";
    await db.query(updateQuery, [newState, id]);
    res.status(200).json({ id, user: "?" });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.delete("/todo/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const query = "delete from todo where id=?;";
    await db.query(query, [id]);
    res.status(200).json({ id });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

// exports
module.exports = router;