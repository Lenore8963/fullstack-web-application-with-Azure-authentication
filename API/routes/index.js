// Defines the routes for the API, such as getting, posting, updating, and deleting Todos. It uses the Todo List controller to handle requests.

const express = require('express');

const todolist = require('../controllers/todolist');

// initialize router
const router = express.Router();

router.get('/todolist', todolist.getTodos);

router.get('/todolist/:id', todolist.getTodo);

router.post('/todolist', todolist.postTodo);

router.put('/todolist/:id', todolist.updateTodo);

router.delete('/todolist/:id', todolist.deleteTodo);

module.exports = router;
