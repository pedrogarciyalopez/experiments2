'use strict';

const koa = require('koa');
const app = new koa();
const fs = require('fs');
const path = require('path');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares'));

middlewares.forEach(mw => app.use(require('./middlewares/' + mw)));

const server = app.listen(3000);
const io = require('socket.io')(server);

const buses = {};

io.on('connection', socket => {
    console.log('Connected!');

    socket.on('message', msg => {
        console.log('Message received!', msg);

        if (!buses.id) {
            socket.on('disconnect', () => {
                socket.broadcast.emit('off', {id: msg.id})
            })
        }

        buses[msg.id] = msg;
        socket.broadcast.emit('message', {buses: Object.keys(buses).map(key => buses[key])});
    });
});