var moment = require('moment');
var Parser = require('../parser').Parser;
var ParsedResult = require('../../result').ParsedResult;
var util = require('../../utils/ZH-Hans.js');

var PATTERN = new RegExp(
    '(\\d+|[' + Object.keys(util.NUMBER).join('') + ']+|半|几)(?:\\s*)' +
    '(?:个)?' +
    '(秒(?:钟)?|分钟|小时|日|天|星期|礼拜|月|年|周)' +
    '(?:(?:之|以)?前|早在)', 'i');

var STRICT_PATTERN = new RegExp('' +
    '(\\W|^)' +
    '(?:within\\s*)?' +
    '(' + util.TIME_UNIT_STRICT_PATTERN + ')' +
    '前(?=(?:\\W|$))', 'i');

var NUMBER_GROUP = 1;
var UNIT_GROUP = 2;

exports.Parser = function ZHHansTimeAgoFormatParser(){
    Parser.apply(this, arguments);

    this.pattern = function() {
        return PATTERN;
    };

    this.extract = function(text, ref, match, opt){
      var index = match.index;
      text = match[0];
  
      var result = new ParsedResult({
        index: index,
        text: text,
        ref: ref
      });
  
      var number = parseInt(match[NUMBER_GROUP]);
      if (isNaN(number)) {
        number = util.zhStringToNumber(match[NUMBER_GROUP]);
      }
  
      if (isNaN(number)) {
        var string = match[NUMBER_GROUP];
        if (string === '几') {
          number = 3;
        } else if (string === '半') {
          number = 0.5;
        } else {
          //just in case
          return null;
        }
      }

    var date = moment(ref);
    var unit = match[UNIT_GROUP];
    var unitAbbr = unit[0];

    if (unitAbbr.match(/[日天星礼月年]/)) {
      if (unitAbbr == '日' || unitAbbr == '天') {
        date.subtract(number, 'd');
      } else if (unitAbbr == '星' || unitAbbr == '礼') {
        date.subtract(number * 7, 'd');
      } else if (unitAbbr == '月') {
        date.subtract(number, 'month');
      } else if (unitAbbr == '年') {
        date.subtract(number, 'year');
      }

      result.start.assign('year', date.year());
      result.start.assign('month', date.month() + 1);
      result.start.assign('day', date.date());
      return result;
    }

    if (unitAbbr == '秒') {
      date.subtract(number, 'second');
    } else if (unitAbbr == '分') {
      date.subtract(number, 'minute');
    } else if (unitAbbr == '小') {
      date.subtract(number, 'hour');
    }

    result.start.imply('year', date.year());
    result.start.imply('month', date.month() + 1);
    result.start.imply('day', date.date());
    result.start.assign('hour', date.hour());
    result.start.assign('minute', date.minute());
    result.start.assign('second', date.second());
    result.tags.ZHHansTimeAgoFormatParser = true;

        // var fragments = util.extractDateTimeUnitFragments(match[2]);
        // var date = moment(ref);

        // for (var key in fragments) {
        //     date.add(-fragments[key], key);
        // }

        // if (fragments['时'] > 0 || fragments['分'] > 0 || fragments['秒'] > 0) {
        //     result.start.assign('时', date.hour());
        //     result.start.assign('分', date.minute());
        //     result.start.assign('秒', date.second());
        //     result.tags['ZHTimeAgoFormatParser'] = true;
        // } 
        
        // if (fragments['d'] > 0 || fragments['month'] > 0 || fragments['year'] > 0) {
        //     result.start.assign('day', date.date());
        //     result.start.assign('month', date.month() + 1);
        //     result.start.assign('year', date.year());
        // } else {
        //     if (fragments['week'] > 0) {
        //         result.start.imply('weekday', date.day());
        //     }

        //     result.start.imply('day', date.date());
        //     result.start.imply('month', date.month() + 1);
        //     result.start.imply('year', date.year());
        // }

        return result;
    };
}
