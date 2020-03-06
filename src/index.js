// const path = require('path')
// const express = require('express')
// const http = require('http')
// const socketio = require('socket.io')
// const Filter = require('bad-words')
// const { generateMessage, generateLocationMessage } = require('./utils/messages')

// const app = express()
// const server = http.createServer(app)
// const io = socketio(server)


// const port = process.env.PORT || 3000

// const publicDirectoryPath = path.join(__dirname, '../public')

// app.use(express.static(publicDirectoryPath))

// // let count = 0


// io.on('connection', (socket) => {
//     console.log('welcome')




//     socket.on('join', ({ username, room }) => {
//         socket.join(room)
//         console.log(room)
//         console.log(username)
//         socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined chatroom ${room} .`))

//         socket.emit('message', generateMessage(`welcome ${username}!`))

//     })

//     socket.on('message', (message, callback) => {
//         const filter = new Filter()
//         if (filter.isProfane(message.message)) {
//             return callback('Profanity is not allowed')
//         }
//         io.to(message.room).emit('message', generateMessage(message.message))
//         callback()
//     })

//     socket.on('location', ({ longitude, latitude,room,username}, callback) => {
//         socket.broadcast.to(room).emit('locationMsg', ({username:username,location:generateLocationMessage(latitude,longitude)})
//         )
//         console.log(username)
//         console.log(room)
//         console.log(username)
//         callback()
//     })

//     socket.on('disconnect', () => {
//         io.emit('message', generateMessage('A user has left your group!'))
//     })

// })







// //     socket.emit('welcomeMessage','welcome')
// // io.on('text',(message) => {
// //      console.log(message)
// // })

// // socket.emit('updatedCount', count)

// // socket.on('increment', () => {
// //     count = count + 1
// //     io.emit('updatedCount', count)
// // })




// server.listen(port, () => {
//     console.log('the chat app is up on ' + port)
// })



const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room,
        })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', `Welcome ${user.username}!`))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined the chatroom.`))


        // const CurrentUsers = getUsersInRoom(user.room)
        // const users = CurrentUsers.map((user) => user.username)
        // console.log(users)

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })


    socket.on('message', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('location', ({ longitude, latitude, }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMsg', generateLocationMessage(user.username, latitude, longitude))

        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left your group!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})



server.listen(port, () => {
    console.log('the chat app is up on ' + port)
})
