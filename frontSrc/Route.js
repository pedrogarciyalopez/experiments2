'use strict';

var Point = require('./Point.js'),
    Stop = require('./Stop.js'),
    Span = require('./Span.js');

function Route(route) {

    this.points = route.points.map(function (point) {
        return new Point(point)
    });

    this.segments = this._setSegments();
    this.length = this._calcLength();
    this.stops = this._setStops(route.stops);
    this.spans = this._setSpans();

}

Route.prototype._setStops = function (stops) {
    var //segments = this.getSegments(),
        _stops = [],
        lastIndex = 0;

    for (var i = 0; i < stops.length; i++) {
        _stops.push(new Stop(stops[i]));
        var position = this.onRoute(_stops[_stops.length - 1], lastIndex);
        lastIndex = position.segmentIndex;
        //console.log(lastIndex);
        _stops[_stops.length - 1].setDistanceFromStart(position.distanceFromStart);
        _stops[_stops.length - 1].setPosition(position.position);
        //segments = segments.slice(position.segmentIndex);
    }

    return _stops;
};

Route.prototype._setSpans = function () {
    var spans = [];

    for (var i = 1; i < this.stops.length; i++) {

        var routeLength = this.getLength(),
            curDisFromStart = this.stops[i].getDistanceFromStart(),
            prevDisFromStart = this.stops[i - 1].getDistanceFromStart(),
            time = this.stops[i].getTime(),
            prevTime = this.stops[i - 1].getTime();

        spans.push(new Span(i, routeLength, curDisFromStart, prevDisFromStart, time, prevTime))
    }

    return spans;
};

Route.prototype._calcLength = function () {
    var distance = 0;

    this.points.reduce(function (prev, current) {
        if (prev !== void(0)) {
            distance += prev.distanceTo(current);
        }
        return current;
    });

    return distance;
};

Route.prototype._setSegments = function () {
    var segments = [],
        lastFinish = 0;

    for (var i = 0; i < this.points.length - 1; i++) {
        segments.push({
            start: lastFinish,
            finish: lastFinish + this.points[i].distanceTo(this.points[i + 1]),
            segment: [this.points[i], this.points[i + 1]]
        });
        lastFinish = segments[segments.length - 1].finish;
    }
    return segments;
};

Route.prototype.getElapsedTime = function (position) {

    if (this.startPosition !== void(0)) position -= this.startPosition;

    var span = this.spans.find(function (span) {
            if (position == 0) {
                return span.id == 1;
            }
            return span.belongsTo(position)
        }),

        posOnSpan = span.getPositionOnSpan(position);

    return span.getElapsedTime(posOnSpan) + span.startTime;
};

Route.prototype.getSegments = function () {
    return this.segments;
};

Route.prototype.onRoute = function (point, segments, lastIndex) {

    if (arguments.length == 2 && typeof segments == 'number') {
        lastIndex = segments;
    }

    if (arguments.length == 1 || typeof segments == 'number') {
        segments = this.segments;
    }

    var d1, d2, distances = [], d;

    for (var i = 0; i < segments.length; i++) {
        d1 = segments[i].segment[0].distanceTo(point) + segments[i].segment[1].distanceTo(point);
        d2 = segments[i].finish - segments[i].start;
        d = Math.abs(d1 - d2);

        if (d < 0.020) {
            distances.push({
                index: i,
                distance: d
            });
        }
    }

    if (!distances.length) return false;

    var min = distances[0].distance,
        index = null,
        segment;

    if (lastIndex !== void(0)) {
        segment = distances.reduce(function(memo, current) {
            if (Math.abs(memo.index - lastIndex) > Math.abs(current.index - lastIndex)) {
                return current;
            } else {
                return memo;
            }
        });
        index = segment.index;
    } else {
        while (segment = distances.pop()) {
            if (segment.distance <= min) {
                min = segment.distance;
                index = segment.index;
            }
        }

        if (index === null) return false;
    }

    return {
        segmentIndex: index,
        distanceFromStart: segments[index].start + point.distanceTo(segments[index].segment[0]),
        position: ((segments[index].start + point.distanceTo(segments[index].segment[0])) / this.getLength()) * 100
    };

};

Route.prototype.setStartPosition = function (position) {
    this.startPosition = position;
};

Route.prototype.getLength = function () {
    return this.length;
};

module.exports = Route;