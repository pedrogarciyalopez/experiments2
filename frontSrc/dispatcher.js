var $ = require('jquery'),
    Route = require('./Route.js'),
    Point = require('./Point.js'),

    routeConfig = require('./94.json'),
    route = new Route(routeConfig),
    buses = {};

function initialize() {

    route.stops.forEach(function (stop) {
        var position = stop.getPosition(),
            marker = document.createElement('div');

        marker.classList.add('bus-stop');
        marker.innerHTML = '<span class="capt">' + stop.id + '</span>';
        marker.setAttribute('style', 'left:' + position + '%');
        routeView.appendChild(marker);
    });

    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
        console.log('connect')
    });

    socket.on('disconnect', () => {
        console.log('disconnect')
    });

    socket.on('message', msg => {
        msg.buses.forEach(bus => {
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
                .css('left', bus.here+'%');

            buses[bus.id].elMustBeHere
                .css('left', bus.mustBeHere+'%');

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

}

document.addEventListener('DOMContentLoaded', initialize);