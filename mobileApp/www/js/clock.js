'use strict';

var stops, routeLength, stop, interval,
    currentStopIndex = 0,
    position = 0,
    step = 0,
    timer = 0;

/**
 * Вычисление шага маркера в процентах от протяженности
 * маршрута, на участке между двумя остановками.
 * @returns {*}
 */
function calcStep() {

    var time, segmentLength;

    stop = stops[currentStopIndex];

    // Если в массиве больше нет остановок, завершаем работу.
    if (stop == void(0)) return false;

    // Вычисляем протяженность участка между двумя
    // остановками и время на его прохождение.
    if (currentStopIndex > 0) {
        segmentLength = stop.distanceFromStart - stops[currentStopIndex - 1].distanceFromStart;
        time = stop.time - stops[currentStopIndex - 1].time;
    } else {
        segmentLength = stop.distanceFromStart + stops[currentStopIndex + 1].distanceFromStart;
        time = stop.time + stops[currentStopIndex + 1].time;
    }

    currentStopIndex++;

    // Вычисляем шаг проходимый за еденицу времени.
    return ((segmentLength / (time / 10)) / segmentLength * 100) * (segmentLength / routeLength);
}

function start() {

    step = calcStep();

    interval = setInterval(function () {
        if (step !== false) {
            position += step;
            timer += 10;

            postMessage({
                position: position,
                time: timer,
                step: step
            });

            // При прохождении участка перевычисляем шаг для следующего.
            if (timer >= stop.time) {
                step = calcStep();
            }
        } else {
            // Конец маршрута.
            clearInterval(interval);
            close();
        }

    }, 10);
}

onmessage = function (e) {

    // Массив остановок.
    stops = e.data[0];
    // Протяженность маршрута.
    routeLength = e.data[1];

    // Сортируем массив остановок по порядку следования.
    stops.sort(function (stop1, stop2) {
        return stop1.id - stop2.id
    });

    // Старт с определенной позиции. Позиция задается
    // в процентах от общей протяженности маршрута.
    if (e.data[2]) {
        position = e.data[2];
        for (var i = 0; i < stops.length; i++) {
            if ((position / 100 * routeLength) >= stops[i].distanceFromStart &&
                (position / 100 * routeLength) < stops[i+1].distanceFromStart) {
                currentStopIndex = i;
                break;
            }
        }
    }

    start();
};