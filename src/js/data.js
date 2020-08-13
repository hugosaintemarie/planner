import calendars from './calendars';
import events from './events';

export default {
    loaded: false,

    init() {
        let data = localStorage.getItem('data');

        if (data) {
            data = JSON.parse(data);

            calendars.getStartEnd();

            for (const event of data.events) events.newEvent(event);

            for (const calendar of data.calendars) {
                // Add calendar
                calendars.newCalendar(calendar);

                // Add all events in that calendar
                for (const event of calendar.events) {
                    events.buildEvent({
                        ...event,
                        calendar: calendar.id
                    });
                }
            }

            calendars.selectFirstCalendar();

            // Save current ids
            calendars.calendarID = Math.max(...data.calendars.map(c => c.id));
            events.eventID = Math.max(...data.calendars.map(c => c.events.map(e => e.id)).flat());

            this.loaded = true;
        }
    },

    save(manual = false) {
        const data = {
            calendars: [...calendars.data],
            events: [...events.data]
        }

        if (manual) {
            // TODO: display message to explain auto-save
        }

        localStorage.setItem('data', JSON.stringify(data));

        // Prevent default browser save window (Cmd + S)
        return false;
    }
}