const express = require("express")
const app = express()
const http = require("http")
const cors = require("cors")
const mysql = require("mysql")
const { Server } = require("socket.io")

// for hashing/encrypting the password
const bcrypt = require("bcrypt")
const saltRounds = 10

// sessions
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const session = require("express-session")

// setting up the app
app.use(express.json())
app.use(cors({
    // need to set this for using cookies - to store whether the user has logged in on this device
    // instead of getting them to relogin on every refresh
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    key: "userId",
    secret: "stefan",
    resave: false,
    saveUninitialized: false,
    cookie: {
        // expires in 24 hours - have to write it in milliseconds
        expires: 60 * 60 * 24,
    },
}))

const server = http.createServer(app)

// socket.io stuff
// setting up the socket.io server and declaring acceptable communication methods
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // it is ok to accept communication with this url (this is the url for react app)
        methods: ["GET", "POST"],
    }
})

const { Users } = require('./users')
let users = new Users()

// listening for events in the socket.io server
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`)

    // notify when user joins a room
    socket.on("join_room", (data) => {
        console.log("JOINING ROOM")
        console.log(data)

        // updating 'users' object
        users.removeUser(socket.id) // remove previous instance of user just in case
        users.addUser(socket.id, data.username, data.roomName)

        socket.join(data.roomName)
        io.to(data.roomName).emit("update_user_list", users.getUserList(data.roomName))
        console.log(`User with ID "${socket.id}" and username "${data.username}" has joined room: ${data.roomName}`) // print to backend
        console.log(users.getUserList(data.roomName))
    })

    // notify when user leaves a room
    socket.on("leave_room", (data) => {
        console.log("LEAVING ROOM")
        console.log(data)

        // updating 'users' object
        users.removeUser(socket.id)

        socket.leave(data.roomName)
        io.to(data.roomName).emit("update_user_list", users.getUserList(data.roomName))
        console.log(`User with ID "${socket.id}" and username "${data.username}" has left room: ${data.roomName}`) // print to backend
        console.log(users.getUserList(data.roomName))
    })

    // when a user finishes writing a word
    socket.on("word_typed", (data) => {
        console.log("WORD HAS BEEN TYPED BY USER - " + data.username)
        console.log(data)

        io.to(data.roomName).emit("update_user_sliders", [data.username, data.wordIndex])
        io.to(data.roomName).emit("update_user_wpm", [data.username, data.currentWPM])
    })

    // listen for disconnecting from the server
    socket.on("disconnect", () => {
        // user that has disconnected
        let user = users.removeUser(socket.id)

        // if user exists
        if (user) {
            io.to(user.roomName).emit("update_user_list", users.getUserList(user.roomName))
        }
        
        console.log("user disconnected", socket.id)
    })
})

// database stuff
const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "password",
    database: "cs_nea",
})

app.post("/register", (req, res) => {
    const username = req.body.username
    const password = req.body.password
    
    if (username.length < 1) {
        console.log("no username entered")
        res.send({message: "no username entered"})
    } else if (password.length < 1) {
        console.log("no password entered")
        res.send({message: "no password entered"})
    }
    else {
        // check if user with that username already exists and tell them to use a different username
        db.query("SELECT * FROM users where username = ?", username, (err, result) => {
            if (err) {
                res.send({err:err})
            } 
            if (result.length > 0) {
                res.send({message: "username already exists"})
            } else {
                // hashing the password
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (err) {
                        console.log(err)
                    }
                    db.query("INSERT INTO users (username, password, bestScore, bestAccuracy, numWins, numLosses) VALUES (?,?,?,?,?,?)", 
                                [username, hash, 0, 0, 0, 0], (err, result) => {
                        console.log(err)
                    })
                })
            }
        })
    }
})

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.send({loggedIn: true, user: req.session.user})
    } else {
        res.send({loggedIn: false})
    }
})

app.post("/login", (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (username.length < 1) {
        console.log("no username entered")
        res.send({message: "no username entered"})
    } else if (password.length < 1) {
        console.log("no password entered")
        res.send({message: "no password entered"})
    } else {
        db.query("SELECT * FROM users WHERE username = ?", username, (err, result) => { if (err) {
                res.send({err: err})
            }

            if (result.length > 0) {
                // check if password is correct
                bcrypt.compare(password, result[0].password, (err, response) => {
                    if (response) {
                        // create a session
                        req.session.user = result
                        console.log(req.session.user)
                        res.send(result)
                    } else {
                        res.send({message: "username or password incorrect"})
                    }
                })
            } else {
                res.send({message: "user doesn't exist"})
            }
        })
    }
})

// rooms db stuff
app.post("/create-room", (req, res) => {
    const roomCreator = req.body.roomCreator
    const roomName = req.body.roomName
    const test = req.body.test // holds the typing test

    db.query("INSERT INTO rooms (roomName, roomCreator, numUsers, testHasStarted, test) VALUES (?,?,?,?,?)", 
            [roomName, roomCreator, 1, false, test], 
            (err, result) => {
                console.log(err)
    })
})

app.get("/get-rooms", (req, res) => {
    db.query("SELECT * FROM rooms", (err, result) => {
        if (err) {
            res.send({err: err})
        } 
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({message: "no rooms found"})
        }
    }) 
})

app.post("/join-room", (req, res) => {
    const roomName = req.body.roomName
    const numUsers = req.body.numUsers

    db.query("UPDATE rooms SET numUsers = ? WHERE roomName = ?", [numUsers, roomName],
            (err, result) => {
                console.log(err)
        })
})

app.post("/leave-room", (req, res) => {
    const roomName = req.body.roomName
    const userDetails = req.body.userLeaving

    db.query("UPDATE rooms SET numUsers = numUsers-1 WHERE roomName = ?", [roomName], 
        (err, result) => {
            console.log(err)
        })
    
    console.log(userDetails.username + " has left room: " + roomName)
})

app.post("/delete-room", (req, res) => {
    const roomName = req.body.roomName
    const roomCreator = req.body.roomCreator

    db.query("DELETE FROM rooms WHERE roomName = ? AND roomCreator = ?", [roomName, roomCreator], 
        (err, result) => {
            console.log(err)
        })
    
    console.log("room with name - " + roomName + " - has been deleted")
})

app.post("/update-userInfo", (req, res) => {
    const username = req.body.username
    const bestScore = req.body.bestScore
    const numWins = req.body.numWins
    const numLosses = req.body.numLosses

    db.query("UPDATE users SET bestScore = ?, numWins = ?, numLosses = ? WHERE username = ?", [bestScore, numWins, numLosses, username], 
        (err, results) => {
            console.log(err)
        })

    console.log(`user with username "${username}" has had bestScore updated to "${bestScore}", number of wins to "${numWins}", and number of losses to "${numLosses}"`)
})

// leaderboard
app.get("/get-leaderboard", (req, res) => {
    db.query("SELECT * FROM leaderboard", (err, result) => {
        if (err) {
            res.send({err:err})
            console.log(err)
        } 
        if (result.length > 0) {
            res.send(result)
        } else {
            res.send({message:"leaderboard cannot be found"})
        }
    })
})

app.post("/update-leaderboard", (req, res) => {
    const newLeaderboard = req.body.newLeaderboard
    // have to put leaderboard into a JSON object so can be stored in database
    let updatedLeaderboard = {}
    updatedLeaderboard['leaderboard'] = newLeaderboard
    db.query("UPDATE leaderboard SET rankings = ?", [JSON.stringify(updatedLeaderboard)], (err, result) => {
        console.log(err)
    })
    console.log("Leaderboard updated to: " + newLeaderboard)
})

server.listen(3001, () => {
    console.log("server is running")
})