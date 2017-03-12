'use strict';

const koa = require('koa');
const app = new koa();
const fs = require('fs');
const path = require('path');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares'));

middlewares.forEach(mw => app.use(require('./middlewares/' + mw)));

const server = app.listen(3000);
const io = require('socket.io')(server);
//io.set('transports', ['websocket']);
io.on('connection', socket => {
    console.log(socket);

    socket.on('message', msg => {
        console.log('Message received!', msg);
        socket.broadcast.emit('message', msg);
    });

    socket.on('disconnect', function () {
        console.log(arguments)
    })
});