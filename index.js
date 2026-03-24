const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const { auth, JWT_SECRET } = require("./auth");

const mongoose = require("mongoose");
const { UserModel, TodoModel } = require("./db");
mongoose.connect("mongodb+srv://admin:123123@cluster0.haxem7m.mongodb.net/todo");

app.use(express.json());

app.post("/signup", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    await UserModel.create({
        email: email,
        password: password,
        name: name
    })

    res.json({
        message: "You are signed up"
    })
});

app.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email,
        password: password
    });

    if (response) {
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_SECRET);

        res.json({
            token: token
        });
    } 
    else {
        res.status(403).json({
            msg: "Incorrect creds"
        });
    }
});

app.post("/todo", auth, async (req, res) => {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await TodoModel.create({
        userId, 
        title,
        done
    });

    res.json({
        msg: "Todo created"
    });
});

app.get("/todos", auth, async (req, res) => {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    });
})

app.listen(3000);