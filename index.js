const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const { auth, JWT_SECRET } = require("./auth");

const mongoose = require("mongoose");
const { UserModel, TodoModel } = require("./db");
mongoose.connect("mongodb+srv://admin:***REMOVED***@cluster0.haxem7m.mongodb.net/todo");

const bcrypt = require("bcrypt");
const { z } = require("zod");

app.use(express.json());

app.post("/signup", async (req, res) => {
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        name: z.string(),
        password: z.string()
    });

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    let errorThrown = false;
    try {
        const hashedPassword = await bcrypt.hash(password, 5);
        console.log(hashedPassword);

        await UserModel.create({
            email: email,
            password: hashedPassword,
            name: name
        });
    }
    catch(e) {
        res.json({
            message: "user already exists"
        })
        errorThrown = true;
    }

    if (!errorThrown) {
        res.json({
            message: "You are signed up"
        });
    }
});

app.post("/signin", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email,
    });

    if (!response) {
        res.status(403).json({
            message: "User does not exist in our db"
        });

        return;
    }

    const passwordMatch = await bcrypt.compare(password, response.password);

    if (passwordMatch) {
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