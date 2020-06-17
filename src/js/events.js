import dates from './dates';
import history from './history';
import selection from './selection';
import settings from './settings';

export default {
    eventID: 0,

    init() {
        // Add new event
        $(document).on('click', '.events-wrap .add', () => {
            this.addNewEvent();
        });

        // Rename event
        $(document).on('input', '.events-wrap ul span', e => {
            const $el = $(e.target);
            this.renameEvent($el);
        });

        // Insert event instances
        $(document).on('click', '.events-wrap ul li', e => {
            const $event = $(e.target).closest('li');
            this.insertEvent($event);
        });

        // // Selected event
        // $(document).on('mousedown', '.events-wrap ul li', e => {
        //     $('.events-wrap ul li.selected').removeClass('selected');
        //     $(e.target).closest('li').addClass('selected');
        // });

        this.addEvents(['Workout', 'Tennis', 'Jogging']);
    },

    addEvents(array) {
        for (const event of array) {
            const $ul = $('.events-wrap ul');
            const type = $ul.find('li').length;
            const li = `<li data-type="${type}" style="background-color: ${settings.eventsColors[type]}" class="sortable">
                <span class="title" contenteditable>${event}</span>
                <span class="tools">
                    <i class="fas fa-caret-down"></i>
                    <i data-tool="sort">⋮⋮</i>
                </span>
            </li>`;
            $ul.append(li);
        }
    },

    addNewEvent() {
        const type = parseInt($('.events-wrap ul li').length);
        const event = `<li data-type="${type}" class="sortable" style="background-color: ${settings.eventsColors[type]}"><span class="title" contenteditable spellcheck="false"></span></li>`;

        const $ul = $('.events-wrap ul');
        $ul.append(event);

        // Select new event and focus span
        $ul.find('li.selected').removeClass('selected');
        $ul.find('li:last-child').addClass('selected');
        $ul.find('li:last-child span').focus();
    },

    renameEvent($el) {
        const val = $el.text();
        const type = $el.closest('li').attr('data-type');

        $(`.event[data-type="${type}"] span`).text(val);
    },

    insertEvent($event) {
        const type = $event.attr('data-type');
    
        const selectedDaysEvents = selection.selectedDays.map(d => {
            const date = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
            return $(`.calendar-wrap .day[data-date="${date}"] .event`).attr('data-type');
        });
    
        if (selectedDaysEvents.every(e => e === type)) {
            // If same type, simply remove event and don't recreate one (toggle-like behavior)
            for (const day of selection.selectedDays) {
                const date = dates.toString(day);
                const $events = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event, .calendar-wrap .day[data-date="${date}"] .event`);
                $events.remove();
            }
        } else {
            const action = {
                type: 'addEvents',
                events: []
            };
    
            for (const day of selection.selectedDays) {
                const date = dates.toString(day);
                const $events = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event, .calendar-wrap .day[data-date="${date}"] .event`);
                $events.remove();
                    
                const $day = $(`.calendar-wrap .day[data-date="${date}"]`);
                
                const event = {
                    id: this.eventID++,
                    calendar: parseInt($('.calendars-wrap .calendar.selected').attr('data-id')),
                    type: type,
                    title: $event.find('.title').text(),
                    color: $event.css('background-color'),
                    start: $day.attr('data-date'),
                    end: $day.attr('data-date')
                };
    
                action.events.push(event);
        
                this.buildEvent(event);
            }
    
            history.pushAction(action);
        }
    },

    buildEvent(event) {
        const [start, end] = [new Date(event.start), new Date(event.end)].sort((a, b) => a > b ? 1 : -1);

        const date = `${start.getFullYear()}-${`${start.getMonth() + 1}`.padStart(2, '0')}-${`${start.getDate()}`.padStart(2, '0')}`;

        const days = [start, end];

        const $el = $(`.calendar[data-id="${event.calendar}"]`).length ? $(`.calendar[data-id="${event.calendar}"] .day[data-date="${date}"]`) : $(`.calendar.selected .day[data-date="${date}"], .calendar-wrap .day[data-date="${date}"]`);

        // Add event
        let classname = ' start end';
        $el.append(`<div data-id="${event.id}" data-type="${event.type}" class="event${classname}" style="background-color: ${event.color}">${classname.includes('start') ? `<span class="title">${event.title}</span>` : ''}</div>`);
    },

    removeEvent(event) {
        $(`.event[data-id="${event.id}"]`).remove();
    },
}