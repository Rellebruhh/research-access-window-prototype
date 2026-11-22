(function (RAW) {
  'use strict';

  var WEEKDAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  var MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  function addWorkingDays(startDate, workingDays) {
    var cursor = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );
    var remaining = workingDays;

    while (remaining > 0) {
      cursor.setDate(cursor.getDate() + 1);
      var day = cursor.getDay();
      if (day !== 0 && day !== 6) {
        remaining -= 1;
      }
    }

    return cursor;
  }

  function formatLongDate(date) {
    var weekday = WEEKDAYS[date.getDay()];
    var dayOfMonth = date.getDate();
    var month = MONTHS[date.getMonth()];
    var year = date.getFullYear();
    return weekday + ', ' + dayOfMonth + ' ' + month + ' ' + year;
  }

  function formatShortDate(date) {
    return date.getDate() + ' ' + MONTHS[date.getMonth()] + ' ' + date.getFullYear();
  }

  RAW.dates = {
    addWorkingDays: addWorkingDays,
    formatLongDate: formatLongDate,
    formatShortDate: formatShortDate
  };
})(window.RAW = window.RAW || {});
