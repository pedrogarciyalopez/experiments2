'use strict';

const koa = require('koa');
const app = new koa();
const fs = require('fs');
const path = require('path');
//const cors = require('koa-cors');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares'));

middlewares.forEach(mw => app.use(require('./middlewares/' + mw)));

//app.use(cors());

const buses = {};

const server = app.listen(3000);
const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('Connected!');

    socket.on('message', msg => {
        console.log('Message received!', msg);
        buses[msg.id] = msg;

        io.emit('message', {buses: Object.keys(buses).map(key => buses[key])});
    });
});