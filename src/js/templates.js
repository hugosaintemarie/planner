import calendars from './calendars';
import dates from './dates';
import events from './events';
import settings from './settings';
import stats from './stats';

export default {
    init() {
        const template = settings.template;

        if (template === 'default') {
            // 1 calendar
            // 3 events
            
            this.createCalendars(1);
            events.newEvent([{ title: 'Workout', color: 5 }, { title: 'Tennis', color: 13 }, { title: 'Jogging', color: 9 }]);

        } else if (template === 'filled') {
            // 3 calendars
            // 3 events
            // 30 random occurences

            this.createCalendars(3);
            events.newEvent([{ title: 'Workout', color: 5 }, { title: 'Tennis', color: 13 }, { title: 'Jogging', color: 9 }]);

            for (let i = 0; i < 30; i += 1) {
                const range = dates.range(calendars.start, calendars.end);
                const date = range[Math.floor(Math.random() * range.length)];
                
                // Get a random event
                const $events = $('.events-wrap ul li');
                const $event = $events.eq(Math.floor(Math.random() * $events.length));

                events.buildEvent({
                    id: events.eventID++,
                    calendar: Math.floor(Math.random() * 3),
                    type: $event.attr('data-type'),
                    title: $event.find('.title').text(),
                    color: $event.css('background-color'),
                    start: date,
                    end: new Date(new Date(date).setDate(date.getDate() + Math.floor(Math.random() * 3)))
                });
            }

            stats.update();

        } else if (template === 'events') {
            // 1 calendar
            // 20 events (for events colors testing)

            this.createCalendars(1);
            events.newEvent([
                { title: 'A', color: 0 },
                { title: 'B', color: 1 },
                { title: 'C', color: 2 },
                { title: 'D', color: 3 },
                { title: 'E', color: 4 },
                { title: 'F', color: 5 },
                { title: 'G', color: 6 },
                { title: 'H', color: 7 },
                { title: 'I', color: 8 },
                { title: 'J', color: 9 },
                { title: 'K', color: 10 },
                { title: 'L', color: 11 },
                { title: 'M', color: 12 },
                { title: 'N', color: 13 },
                { title: 'O', color: 14 },
                { title: 'P', color: 15 },
                { title: 'Q', color: 16 },
                { title: 'R', color: 17 },
                { title: 'S', color: 18 },
                { title: 'T', color: 19 }
            ]);
        }
    },

    createCalendars(n = 1) {
        calendars.getStartEnd();
        const calendar = calendars.buildCalendar();

        $('.calendars-wrap .calendars').append(this.sidebarCalendars(calendar, n));
        $('.calendar-wrap .content').html(calendar).addClass('selected');
    },

    sidebarCalendars(calendar, n = 1) {
        let html = '';

        for (let i = 0; i < n; i += 1) {
            html += `<div class="calendar sortable${i === 0 ? ' selected' : ''}" data-id="${i}">
                <div class="tools">
                    <i data-tool="toggle" class="far fa-eye"></i>
                    <i data-tool="sort">⋮⋮</i>
                    <i data-tool="duplicate" class="far fa-clone"></i>
                    <i data-tool="delete" class="far fa-trash-alt"></i>
                </div>
                <div class="content">${calendar}</div>
                <p><span contenteditable>Calendar ${i + 1}</span></p>
            </div>`;
        }

        return html;
    }
}