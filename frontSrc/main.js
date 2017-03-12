'use strict';

var Route = require('./Route.js'),
    Point = require('./Point.js'),
    $ = require('jquery'),

    routeConfig = require('./94.json'),
    clock = false,
    route = new Route(routeConfig),
    index = 0,
    me = {};

function makeClock(time) {
    var sign = '';

    if (time < 0) {
        sign = '-';
        time = Math.abs(time);
    }

    return sign + [
            ('00' + Math.floor(time / 3600000)).slice(-2),
            ('00' + Math.floor(time % 3600000 / 60000)).slice(-2),
            ('00' + Math.floor(time % 3600000 % 60000 / 1000)).slice(-2)
        ].join(':');
}

function scroll(delta) {
    var negative = delta < 0;

    delta = Math.abs(delta);

    var offset = Math.ceil(delta / 60);

    var i = setInterval(function () {
        if (delta - offset < offset) {
            offset += (delta - offset);
        }
        delta -= offset;

        if (negative) {
            window.scrollBy((0 - offset), 0);
        } else {
            window.scrollBy(offset, 0);
        }

        if (!delta) {
            clearInterval(i);
        }
    }, 5)
}

function checkOffset(el) {
    var screen = window.document.documentElement.clientWidth,
        right = el.getBoundingClientRect().right;

    if (right >= screen - 35 || right < 35) {
        scroll(right - 35);
    }
}

document.addEventListener("DOMContentLoaded"/*'deviceready'*/, function () {
    var //mustBeHere = document.querySelector('.must-be-here'),
        position = 0,
        me = {
            //el: document.querySelector('.bus'),
            position: null,
            fromStart: 0
        };

    const socket = io('http://192.168.0.102:3000');
    socket.on('connect', function(){console.log('connect')});
    socket.on('disconnect', function(){console.log('disconnect')});

/*    watch.onclick = function () {
        console.log('watching');
        socket.on('message', function(msg){
            mustBeHere.setAttribute('style', 'width:' + msg + '%');
        });
    };*/


    /*document.onclick = function () {
        checkOffset(me.el);
    };*/

    route.stops.forEach(function (stop) {
        var position = stop.getPosition(),
            marker = document.createElement('div');

        marker.classList.add('bus-stop');
        marker.innerHTML = '<span class="capt">' + stop.id + '</span>';
        marker.setAttribute('style', 'left:' + position + '%');
        routeView.appendChild(marker);
    });


    startBtn.onclick = function () {

        if (clock !== false) {
            clock.terminate();
            clock = false;
            startBtn.innerHTML = 'Поехали';
            return;
        } else {
            startBtn.innerHTML = 'Стоп'
        }

        clock = new Worker('clock.js');

        clock.onmessage = function (message) {

            if (!me.el) {
                me.el = $('<div class="bus"></div>');
                me.elMustBeHere = $('<div class="bus must-be-here"></div>');

                $(routeView).append(me.el);
                $(routeView).append(me.elMustBeHere);
            }

            socket.emit('message', {id: busId.value, here: message.data.position, mustBeHere: message.data.position});
            me.elMustBeHere.css('width', message.data.position + '%');

            if (Math.floor((route.getElapsedTime(position) - message.data.time)) < 0) {
                me.el.addClass('lag');
                me.elMustBeHere.addClass('lead');
            } else if (Math.floor((route.getElapsedTime(position) - message.data.time)) > 0) {
                me.el.addClass('lead');
                me.elMustBeHere.addClass('lag');
            } else {
                me.el.removeClass('lag lead');
                me.elMustBeHere.removeClass('lag lead');
            }

            timer.innerHTML = makeClock(Math.floor((route.getElapsedTime(position) - message.data.time)));
        };

        clock.onerror = function (e) {
            console.log(e);
        };


        clock.postMessage([route.stops, route.getLength()]);
    };

    navigator.geolocation.watchPosition(function (pos) {

        if (clock === false) return;

        var onRoute = route.onRoute(new Point([
            pos.coords.latitude,
            pos.coords.longitude
        ]), index);

        if (onRoute === false) return;

        index = onRoute.segmentIndex;
        position = onRoute.position;

        me.elMustBeHere.css('width', position + '%');
        //checkOffset(me.el);

    }, function () {

    }, {enableHighAccuracy: true});

}, false);