import { timeFormatLocale } from 'd3-time-format';

import {
  timeYear,
  timeMonth,
  timeWeek,
  timeDay,
  timeHour,
  timeMinute,
  timeSecond,
} from 'd3-time';

const cnTimeFormat = date => {
  const CN = timeFormatLocale({
    dateTime: '%a %b %e %X %Y',
    date: '%m/%d/%Y',
    time: '%H:%M:%S',
    periods: ['AM', 'PM'],
    days: [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ],
    shortDays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    months: [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
    ],
    shortMonths: [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月',
    ],
  });

  const formatMillisecond = CN.format('.%L'),
    formatSecond = CN.format(':%S'),
    formatMinute = CN.format('%I:%M'),
    formatHour = CN.format('%I %p'),
    formatDay = CN.format('%a %d'),
    formatWeek = CN.format('%b %d'),
    formatMonth = CN.format('%B'),
    formatYear = CN.format('%Y');

  return (timeSecond(date) < date
    ? formatMillisecond
    : timeMinute(date) < date
      ? formatSecond
      : timeHour(date) < date
        ? formatMinute
        : timeDay(date) < date
          ? formatHour
          : timeMonth(date) < date
            ? timeWeek(date) < date ? formatDay : formatWeek
            : timeYear(date) < date ? formatMonth : formatYear)(date);
};

export default cnTimeFormat;
