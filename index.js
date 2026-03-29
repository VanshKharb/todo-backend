const express = require("express");
const app = express();

const jwt = require("jsonwebtoken");
const { auth, JWT_SECRET } = require("./auth");

const mongoose = require("mongoose");
const { UserModel, TodoModel } = require("./db");
mongoose.connect("");

const bcrypt = require("bcrypt");
const { z } = require("zod");

app.use(express.json());

app.post("/signup", async (req, res) => {
    const requiredBody = z.object({
        email: z.string().email().max(100),
        name: z.string().min(1).max(50),
        password: z.string().min(8).max(50),
    });

    const parsedDataWithSuccess = requiredBody.safeParse(req.body);

    if (!parsedDataWithSuccess.success) {
        return res.status(400).json({
            message: "incorrect format",
            error: parsedDataWithSuccess.error
        })
    }

    const {email, name, password} = parsedDataWithSuccess.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({
            email: email,
            password: hashedPassword,
            name: name
        });

        return res.json({
            message: "You are signed up"
        });
    }
    catch(e) {
        if (e.code === 11000) {
            return res.status(409).json({
                message: "User already exists",
            });
        }
        else {
            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
});

app.post("/signin", async (req, res) => {
    const signinSchema = z.object({
        email: z.string().email().max(50),
        password: z.string().min(8).max(50),
    });

    const parsedData = signinSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.json({
            message: "Invalid username or password",
        });
    }

    const {email, password} = parsedData.data;

    try {
        const response = await UserModel.findOne({
            email: email,
        });

        if (!response) {
            return res.status(403).json({
                message: "Invalid username or password",
            });
        }

        const passwordMatch = await bcrypt.compare(password, response.password);
 
        if (!passwordMatch) {
            return res.status(403).json({
                messasge: "Invalid username or password",
            });
        }

        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_SECRET, {expiresIn: "1h"});

        return res.json({
            token: token
        });
    }
    catch(e) {
        return res.status(500).json({
            message: "Internal sever error",
        });
    }
});

app.post("/todo", auth, async (req, res) => {
    const userId = req.userId;

    const todoSchema = z.object({
        title: z.string().min(1).max(50),
        done: z.boolean(),
    });

    const parsed = todoSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid todo input",
        });
    }

    const {title, done} = parsed.data;

    await TodoModel.create({
        userId, 
        title,
        done
    });

    res.json({
        messasge: "Todo created"
    });
});

app.get("/todos", auth, async (req, res) => {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId,
    });

    res.json({
        todos,
    });
})

app.listen(3000);