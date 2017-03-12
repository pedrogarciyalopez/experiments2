'use strict';

function Span(id, routeLength, curDisFromStart, prevDisFromStart, time, prevTime) {

    var timeSpan = time - prevTime,
        startTime = time - timeSpan,
        spanEnd = curDisFromStart / routeLength * 100,
        prevSpanEnd = prevDisFromStart / routeLength * 100,
        spanLength = spanEnd - prevSpanEnd,
        spanStart = spanEnd - spanLength;


    this.id = id;
    this.end = spanEnd;
    this.start = spanStart;
    this.spanLength = spanLength;
    this.startTime = startTime;
    this.timeSpan = timeSpan;
}

Span.prototype.getStart = function () {
    return this.start;
};

Span.prototype.getEnd = function () {
    return this.end;
};

Span.prototype.getPositionOnSpan = function (position) {
    return (position - this.start) / this.spanLength * 100;
};

Span.prototype.getElapsedTime = function (posOnSpan) {
    return (this.timeSpan / 100) * posOnSpan;
};

Span.prototype.belongsTo = function (position) {
    return this.end >= position && this.start < position;
};

module.exports = Span;