const fs = require('fs');
const { google } = require('googleapis');
const reqValidator = require('../../Utility/requirement-validator.js');
const appUtil = require('../../Utility/appUtil.js');

const DOMPurify = require('dompurify');
const TIMESLOTS_PATH = './Utility/timeslots.json';
/**
 * Searches using the provided date for a timeslot matching the hour and minute specified.
 * @param {object} timeslots  Object containing info on each timeslot for the day.
 * @param {number} year  Year of the timeslot to search for.
 * @param {number} month  Month of the timeslot to search for.
 * @param {number} day  Day of the timeslot to search for.
 * @param {number} hour  Hour of the timeslot to search for.
 * @param {number} minute  Minute of the timeslot to search for.
 * @returns {object}  The timeslot object that was found. If nothing was found, returns undefined.
 */
function findMatchingTimeslot(timeslots, year, month, day, hour, minute) {
    const timeslotDate = new Date(Date.UTC(year, month - 1, day, hour, minute)).toISOString();
    const foundTimeslot = timeslots.find(function(element) {
        //const elementDate = new Date(element.startTime).toISOString(); // Ensure matching ISO format.
        return element.startTime.includes(hour + ':' + minute + ':00');
    });
    if (!foundTimeslot) return false;
    return { time: foundTimeslot, date: timeslotDate };
}

/**
 * Books an appointment using the given date and time information.
 * @param {object} auth  The oAuth2Client used for authentication for the Google Calendar API.
 * @param {number} year  Year of the timeslot to book.
 * @param {number} month  Month of the timeslot to book.
 * @param {number} day  Day of the timeslot to book.
 * @param {number} hour  Hour of the timeslot to book.
 * @param {number} minute  Minute of the timeslot to book.
 * @returns {promise}  A promise representing the eventual completion of the bookAppointment() function.
 */
function bookAppointment(auth, year, month, day, hour, minute, name, desc, email) {
    return new Promise(function(resolve, reject) {
        const isInvalid = reqValidator.validateBooking(year, month, day, hour, minute);
        if (isInvalid) return reject(isInvalid);

        const timeslots = (JSON.parse(fs.readFileSync(TIMESLOTS_PATH))).timeslots;
        const timeslot = findMatchingTimeslot(timeslots, year, month, day, hour, minute);
        if (!timeslot) return resolve({ success: false, message: 'Invalid time slot' });
        const date = year + '-' + month + '-' + day;
        const event = appUtil.makeEventResource(date, timeslot.time.startTime, timeslot.time.endTime, name, desc, email);

        const calendar = google.calendar({ version: 'v3', auth });

        // Check if an event already exists for the specified date
        calendar.events.list({
            calendarId: 'primary',
            timeMin: date + timeslot.time.startTime,
            timeMax: date + timeslot.time.endTime
        }, function(err, res) {
            if (err) return console.log('Error contacting the Calendar service: ' + err);

            if (res.data.items.length > 0) {
                // Event already exists for the day, you can handle this case as needed
                return resolve({ success: false, message: 'An event already exists for this date' });
            } else {
                // Event doesn't exist, create it
                calendar.events.insert({
                    auth: auth,
                    calendarId: 'primary',
                    resource: event
                }, function(err, res) {
                    if (err) return console.log('Error contacting the Calendar service: ' + err);
                    const createdEvent = res.data;
                    console.log('Appointment created: ', createdEvent.id);

                    const result = { startTime: createdEvent.start.dateTime, endTime: createdEvent.end.dateTime };
                    // Return the HTML response
                    return resolve({ success: true, message: result });
                });
            }
        });
    });

}

module.exports = {
    bookAppointment
};
