/*


*/

var moment = require('moment');
var Parser = require('../parser').Parser;
var ParsedResult = require('../../result').ParsedResult;

var PATTERN = new RegExp(
    '(立(?:刻|即)|即刻)|' +
    '(今|明|前|大前|后|大后|昨)(早|晚)|' +
    '(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|' +
    '(今|明|前|大前|后|大后|昨)(?:日|天|号)' +
    '(?:[\\s|,|，]*)' +
    '(?:(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?', 'i'
);

var NOW_GROUP = 1;
var DAY_GROUP_1 = 2;
var TIME_GROUP_1 = 3;
var TIME_GROUP_2 = 4;
var DAY_GROUP_3 = 5;
var TIME_GROUP_3 = 6;

exports.Parser = function ZHHansCasualDateParser() {

    Parser.apply(this, arguments);

    this.pattern = function () {
        return PATTERN;
    };

    this.extract = function (text, ref, match, opt) {
        text = match[0];
        var index = match.index;
        var result = new ParsedResult({
            index: index,
            text: text,
            ref: ref,
        });

        var refMoment = moment(ref);
        var startMoment = refMoment.clone();

        if (match[NOW_GROUP]) {
            result.start.imply('hour', refMoment.hour());
            result.start.imply('minute', refMoment.minute());
            result.start.imply('second', refMoment.second());
            result.start.imply('millisecond', refMoment.millisecond());
        } else if (match[DAY_GROUP_1]) {
            var day1 = match[DAY_GROUP_1];
            var time1 = match[TIME_GROUP_1];

            if (day1 == '明') {
                // Check not "Tomorrow" on late night
                if (refMoment.hour() > 1) {
                    startMoment.add(1, 'day');
                }
            } else if (day1 == '昨') {
                startMoment.add(-1, 'day');
            } else if (day1 == "前") {
                startMoment.add(-2, 'day');
            } else if (day1 == "大前") {
                startMoment.add(-3, 'day');
            } else if (day1 == "后") {
                startMoment.add(2, 'day');
            } else if (day1 == "大后") {
                startMoment.add(3, 'day');
            }

            if (time1 == '早') {
                result.start.imply('hour', 6);
            } else if (time1 == '晚') {
                result.start.imply('hour', 22);
                result.start.imply('meridiem', 1);
            }

        } else if (match[TIME_GROUP_2]) {
            var timeString2 = match[TIME_GROUP_2];
            var time2 = timeString2[0];
            if (time2 == '早' || time2 == '上') {
                result.start.imply('hour', 6);
            } else if (time2 == '下') {
                result.start.imply('hour', 15);
                result.start.imply('meridiem', 1);
            } else if (time2 == '中') {
                result.start.imply('hour', 12);
                result.start.imply('meridiem', 1);
            } else if (time2 == '夜' || time2 == '晚') {
                result.start.imply('hour', 22);
                result.start.imply('meridiem', 1);
            } else if (time2 == '凌') {
                result.start.imply('hour', 0);
            }

        } else if (match[DAY_GROUP_3]) {
            var day3 = match[DAY_GROUP_3];

            if (day3 == '明') {
                // Check not "Tomorrow" on late night
                if (refMoment.hour() > 1) {
                    startMoment.add(1, 'day');
                }
            } else if (day3 == '昨') {
                startMoment.add(-1, 'day');
            } else if (day3 == "前") {
                startMoment.add(-2, 'day');
            } else if (day3 == "大前") {
                startMoment.add(-3, 'day');
            } else if (day3 == "后") {
                startMoment.add(2, 'day');
            } else if (day3 == "大后") {
                startMoment.add(3, 'day');
            }


            var timeString3 = match[TIME_GROUP_3];
            if (timeString3) {
                var time3 = timeString3[0];
                if (time3 == '早' || time3 == '上') {
                    result.start.imply('hour', 6);
                } else if (time3 == '下') {
                    result.start.imply('hour', 15);
                    result.start.imply('meridiem', 1);
                } else if (time3 == '中') {
                    result.start.imply('hour', 12);
                    result.start.imply('meridiem', 1);
                } else if (time3 == '夜' || time3 == '晚') {
                    result.start.imply('hour', 22);
                    result.start.imply('meridiem', 1);
                } else if (time3 == '凌') {
                    result.start.imply('hour', 0);
                }
            }
        }

        result.start.assign('day', startMoment.date())
        result.start.assign('month', startMoment.month() + 1)
        result.start.assign('year', startMoment.year())
        result.tags.ZHHansCasualDateParser = true;
        return result;
    };
};