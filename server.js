const express = require("express")
const app = express()

app.set("view engine", "ejs")

app.get("/", (req, res) => {
    console.log("get")
    res.render("index", {text: "world"})
})

app.get('/users', (req, res) => {
    res.send('User list')
})

app.get('/users/new', (req, res) => {
    res.send('New user form')
})

app.listen(3000, () => {
  console.log("Server is running on port 3000")
})
