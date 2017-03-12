'use strict';

function _toRad(deg) {
    return deg * Math.PI / 180;
}

function Point(latlongs) {
    this.lat = latlongs[0];
    this.lon = latlongs[1];
}

Point.prototype.getLatLongs = function () {
    return [this.lat, this.lon];
};

Point.prototype.distanceTo = function (point) {
    var lat1 = this.lat,
        lon1 = this.lon,
        lat2 = point.getLatLongs()[0],
        lon2 = point.getLatLongs()[1],
        R = 6371,
        dLat = _toRad((lat2 - lat1)),
        dLon = _toRad((lon2 - lon1)),
        a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(_toRad(lat1)) * Math.cos(_toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

module.exports = Point;