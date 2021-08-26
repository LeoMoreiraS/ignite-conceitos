const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.headers.username;
  if(!username){
    return response.status(404).json({error:"unauthorized"});  
  }
  const user = users.find(u =>u.username === username);
  if(!user){
    return response.status(404).json({error:"invalid username"}); 
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name,username} = request.body;
  if(!name||!username){
    return response.status(400).json("Missing params");
  }
  const user = { 
    id: uuidv4(),
    name: name,
    username: username,
    todos:[]
  }
  const UserAlreadyExists = users.find(u=>user.username===u.username);
  if(UserAlreadyExists){
    return response.status(400).json({error:"User already exists"});
  }
  users.push(user);
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user;
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title,deadline} = request.body;
  const {todos} = request.user;
  const newTodo ={
    id: uuidv4(),
    title: title,
    done:false,
    deadline: deadline,
    created_at: new Date(),
  }
  todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title,deadline} = request.body;
  const {todos} = request.user;
  const {id} = request.params;
  const todo = todos.find(todo=>todo.id === id)
  if(!todo){
    return response.status(404).json({error:"todo not found"});
  }
  todo.title = title;
  todo.deadline = deadline;
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user;
  const {id} = request.params;
  const todo = todos.find(todo=>todo.id === id)
  if(!todo){
    return response.status(404).json({error:"todo not found"});
  }
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {todos} = request.user;
  const id = request.params.id;
  const todo = todos.find(t=>t.id==id);
  if(!todo){
    return response.status(404).json({error:"todo not found"});
  }
  todos.splice(todo, 1);
  return response.status(204).send();
});

module.exports = app;