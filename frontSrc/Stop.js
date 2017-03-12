'use strict';

var Point = require('./Point.js');

function Stop(stop) {
    Point.call(this, stop.position);

    this.id = stop.id;
    this.name = stop.name;
    this.time = stop.time;
}

Stop.prototype = Object.create(Point.prototype);
Stop.prototype.constructor = Stop;

Stop.prototype.setDistanceFromStart = function (distance) {
    this.distanceFromStart = distance;
};

Stop.prototype.setPosition = function (position) {
    this.position = position;
};

Stop.prototype.getDistanceFromStart = function () {
    return this.distanceFromStart;
};

Stop.prototype.getPosition = function () {
    return this.position;
};

Stop.prototype.getName = function () {
    return this.name;
};

Stop.prototype.getTime = function () {
    return this.time;
};

module.exports = Stop;