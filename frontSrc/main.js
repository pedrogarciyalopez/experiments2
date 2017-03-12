'use strict';

var Route = require('./Route.js'),
    Point = require('./Point.js'),
    $ = require('jquery'),

    routeConfig = require('./moscow.json'),
    clock = false,
    route = new Route(routeConfig),
    index = 0;

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

    var position = 0,
        me = {},
        buses = {},
        latitude = null,
        longitude = null;

    startBtn.onclick = function () {

        const socket = io('http://' + serverIp.value + ':3000');//192.168.0.106

        socket.on('off', msg => {
            if (buses[msg.id]) {
                buses[msg.id].el.remove();
                buses[msg.id].elMustBeHere.remove();
                delete buses[msg.id];
            }
        });

        socket.on('message', msg => {
            msg.buses.forEach(bus => {
                if (bus.id == busId.value) return;

                if (!buses[bus.id]) {
                    var el = $('<div class="another-bus"><span>' + bus.id + '</span></div>'),
                        elMustBeHere = $('<div class="another-bus must-be-here"><span>' + bus.id + '</span></div>');

                    buses[bus.id] = {
                        el,
                        elMustBeHere
                    };

                    $(routeView).append(el);
                    $(routeView).append(elMustBeHere);
                }

                buses[bus.id].el
                    .css('left', bus.here + '%');

                buses[bus.id].elMustBeHere
                    .css('left', bus.mustBeHere + '%');

                if (bus.here > bus.mustBeHere) {
                    buses[bus.id].el.removeClass('lag').addClass('lead');
                    buses[bus.id].elMustBeHere.removeClass('lead').addClass('lag');
                } else if (bus.here < bus.mustBeHere) {
                    buses[bus.id].el.removeClass('lead').addClass('lag');
                    buses[bus.id].elMustBeHere.removeClass('lag').addClass('lead');
                } else {
                    buses[bus.id].el.removeClass('lag lead');
                    buses[bus.id].elMustBeHere.removeClass('lag lead');
                }
            });
        });

        socket.on('connect', () => console.log('connect'));

        socket.on('disconnect', () => console.log('disconnect'));

        route.stops.forEach(function (stop) {
            var position = stop.getPosition(),
                marker = document.createElement('div');

            marker.classList.add('bus-stop');
            marker.innerHTML = '<span class="capt">' + stop.id + '</span>';
            marker.setAttribute('style', 'left:' + position + '%');
            routeView.appendChild(marker);
        });


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

            socket.emit('message', {
                id: busId.value,
                here: position,
                mustBeHere: message.data.position,
                latitude,
                longitude
            });

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

        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;

        if (onRoute === false) return;

        index = onRoute.segmentIndex;
        position = onRoute.position;

        me.elMustBeHere.css('width', position + '%');
        //checkOffset(me.el);

    }, function () {

    }, {enableHighAccuracy: true});

}, false);