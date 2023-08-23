// imports
const express = require("express");
const Todo = require("../models/Todo");

// vars
const router = express.Router();


// routers
router.get("/todo", async (req, res, next) => {
  try {
    const todos = await Todo.selectByOne("state", 0);
    res.status(200).json(todos);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.get("/doneTodo", async (req, res, next) => {
  try {
    const todos = await Todo.selectByOne("state", 1);
    res.status(200).json(todos);
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.post("/todo/new", async (req, res, next) => {
  try {
    const todo = req.body;
    const id = await Todo.insert(todo);
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
    await Todo.updateContentByOne("id", id, todo);
    res.status(200).json({ id, user: "?" });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.put("/todo/:id/toggle", async (req, res, next) => {
  try {
    const id = req.params.id;
    const todo = await Todo.selectByOne("id", id);
    const state = todo[0].state;
    const newState = state ? 0 : 1;
    await Todo.updateStateByOne("id", id, newState);
    res.status(200).json({ id, user: "?" });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

router.delete("/todo/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await Todo.deleteByOne("id", id);
    res.status(200).json({ id });
  } catch(err) {
    console.error(err);
    next(err);
  }
});

// exports
module.exports = router;