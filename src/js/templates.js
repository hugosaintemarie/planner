import calendars from './calendars';
import categories from './categories';
import data from './data';
import dates from './dates';
import events from './events';
import settings from './settings';
import stats from './stats';

export default {
    init() {
        if (data.loaded) return;

        const template = settings.template;

        if (template === 'default') {
            // 1 calendar
            // 3 categories

            this.createCalendars(1);

            categories.build([
                { title: 'Workout', color: 5 },
                { title: 'Tennis', color: 13 },
                { title: 'Jogging', color: 9 }
            ]);
        }
        else if (template === 'filled') {
            // 3 calendars
            // 3 categories
            // 30 events

            this.createCalendars(3);

            categories.build([
                { title: 'Workout', color: 5 },
                { title: 'Tennis', color: 13 },
                { title: 'Jogging', color: 9 }
            ]);

            for (let i = 0; i < 30; i += 1) {
                const range = dates.range(calendars.start, calendars.end);
                
                const start = range[Math.floor(Math.random() * range.length)];
                start.setHours(Math.random() * 2 + 10);

                // const end = new Date(new Date(start).setDate(start.getDate() + Math.floor(Math.random() * 3)));
                const end = new Date(start);
                end.setHours(start.getHours() + Math.floor(Math.random() * 4) + 1);

                events.build({
                    id: ++events.id,
                    calendar: Math.floor(Math.random() * 3),
                    category: Math.floor(Math.random() * 3),
                    start,
                    end
                });
            }

            stats.update();
        }
        else if (template === 'events') {
            // 1 calendar
            // 20 categories (to test all 20 colors)
            // 20 events (one per category)

            this.createCalendars(1);
            categories.build([
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

            for (let i = 0; i < 20; i += 1) {
                const date = dates.relativeDate(calendars.start, i);

                events.build({
                    id: ++categories.id,
                    calendar: 0,
                    category: i,
                    start: date,
                    end: date
                });
            }
        }
    },

    createCalendars(n = 1) {
        calendars.getStartEnd();
        for (let i = 0; i < n; i += 1) calendars.build();

        calendars.selectFirst();
    }
}