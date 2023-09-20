const {google} = require('googleapis');
const reqValidator = require('../../Utility/requirement-validator.js');
const appUtil = require('../../Utility/appUtil.js');


function getCalendarEvents(auth, year, month, day) {
  return new Promise(function(resolve, reject) {
    const calendar = google.calendar({ version: 'v3', auth });
    const date = year + '-' + month + '-' + day;
    calendar.events.list({
      auth: auth,
      calendarId: 'primary',
      timeMin: date + 'T00:00:00-07:00',
      timeMax: date + 'T23:59:59-07:00',
      singleEvents: true,
      orderBy: 'startTime'
    }, function(err, res) {
      if (err) return reject(err);
      const events = res.data.items;
      return resolve(events);
    });
  });
}

const checkAvailability = (date, startTime, endTime) => {
  const events = getCalendarEvents(auth, date, startTime, endTime);
  if (events.length === 0) {
    return true;
  }
  return false;
};

module.exports = {
    getCalendarEvents,
    checkAvailability
};

