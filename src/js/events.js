import calendars from './calendars';
import dates from './dates';
import events from './events';
import history from './history';
import selection from './selection';
import settings from './settings';
import stats from './stats';

export default {
    eventID: 0,
    type: 0,

    init() {
        // Add new event
        $(document).on('click', '.events-wrap .add', () => {
            this.newEvent();
            return false;
        });

        // Rename event
        $(document).on('input', '.events-wrap ul span', e => {
            const $el = $(e.target);
            this.renameEvent($el);
        });

        // Insert event instances
        $(document).on('click', '.events-wrap ul li', e => {
            const $el = $(e.target);
            if ($el.is('.tools') || $el.parents().is('.tools')) return;

            const $event = $el.closest('li');
            this.insertEvent($event);
        });

        // Open dropdown menu
        $(document).on('click', '.events-wrap ul li [data-tool="dropdown"]', e => {
            // Close any open dropdown menu
            $('.dropdown.visible').removeClass('visible');
            $('#color-swatch').removeClass('visible');

            const $dropdown = $(e.target).closest('li').find('.dropdown');
            $dropdown.toggleClass('visible');
            e.stopPropagation();
        });

        // Click outside
        $(document).on('click', e => {
            if ($(e.target).is('#color-swatch')) return;

            // Close dropdown menu
            $('.dropdown.visible').removeClass('visible');
            $('#color-swatch').removeClass('visible');

            if ($(e.target).parents().is('[data-tool="dropdown"], .dropdown')) return;

            // Remove contenteditable attr
            $('.events-wrap ul li .title[contenteditable]').removeAttr('contenteditable');
        });

        // Rename event
        $(document).on('click', '.events-wrap ul li [data-tool="rename"]', e => {
            const $title = $(e.target).closest('li').find('span.title');
            $title.attr('contenteditable', 'true').focus();

            const setEndOfContenteditable = (contentEditableElement) => {
                let range = document.createRange();
                range.selectNodeContents(contentEditableElement);
                range.collapse(false);
                let selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }

            setEndOfContenteditable($title[0]);

            // Close dropdown menu
            $('.dropdown.visible').removeClass('visible');

            // Prevent li click
            return false;
        });

        // Open color swatch
        $(document).on('click', '.events-wrap ul li [data-tool="color"]', e => {
            const $el = $(e.target.closest('li'));

            // Select current event color
            $('#color-swatch .color.selected').removeClass('selected');
            $($('#color-swatch .color').toArray().find(c => $(c).css('background-color') === $el.css('background-color'))).addClass('selected');

            // Open swatch
            $('#color-swatch')
            .css({
                'top': $el.position().top + $el.outerHeight(),
                'left': $el.position().left
            })
            .addClass('visible')
            .attr('data-type', $el.attr('data-type'));

            // Close dropdown
            $('.dropdown.visible').removeClass('visible');

            return false;
        });

        // Change event color
        $(document).on('click', '#color-swatch .color', e => {
            const $color = $(e.target);
            const eventType = $('#color-swatch').attr('data-type');

            $('#color-swatch .color.selected').removeClass('selected');
            $color.addClass('selected');

            const color = $color.css('background-color')
            $(`.events-wrap ul li[data-type="${eventType}"], .event[data-type="${eventType}"]`).css('background-color', color);
            $(`.stat[data-type="${eventType}"] .event-icon`).css('background-color', color);

            return false;
        });

        // Rename event
        $(document).on('click', '.events-wrap ul li [data-tool="delete"]', e => {
            const $el = $(e.target).closest('li');
            const type = $el.attr('data-type');
            $el.remove();
            this.removeEventsByType(type);
            stats.update();
        });

        // // Selected event
        // $(document).on('mousedown', '.events-wrap ul li', e => {
        //     $('.events-wrap ul li.selected').removeClass('selected');
        //     $(e.target).closest('li').addClass('selected');
        // });

        for (const color of settings.eventsColors) {
            $('#color-swatch').append(`<div class="color" style="background-color: ${color}"></div>`);
        }
    },

    newEvent(events) {
        if (!Array.isArray(events)) events = [events];

        for (const event of events) {
            const type = ++this.type;
            const li = `<li data-type="${type}" class="sortable" style="background-color: ${event && event.color ? settings.eventsColors[event.color] : settings.eventsColors[type]}">
                <span class="title" ${!event ? 'contenteditable' : ''} spellcheck="false">${event && event.title ? event.title : ''}</span>
                <span class="tools">
                    <i class="fas fa-angle-down" data-tool="dropdown"></i>
                    <i data-tool="sort">⋮⋮</i>
                    <span class="dropdown">
                        <span data-tool="rename"><i class="fas fa-pen"></i> Rename</span>
                        <span data-tool="color"><i class="fas fa-palette"></i> Change color</span>
                        <span data-tool="delete"><i class="far fa-trash-alt"></i> Delete</span>
                    </span>
                </span>
            </li>`;

            const $ul = $('.events-wrap ul');
            $ul.append(li);

            // Select new event
            $ul.find('li.selected').removeClass('selected');
            $ul.find('li:last-child').addClass('selected');

            // Focus span if empty
            if (!event) $ul.find('li:last-child .title').focus();
        }

        stats.update();
    },

    renameEvent($el) {
        const val = $el.text();
        const type = $el.closest('li').attr('data-type');

        $(`.event[data-type="${type}"] span`).text(val);

        stats.update();
    },

    insertEvent($event) {
        const type = $event.attr('data-type');
    
        const selectedDaysEvents = selection.selectedDays.map(d => {
            const date = dates.toString(d);
            return $(`.calendar-wrap .day[data-date="${date}"] .event`).attr('data-type');
        });
    
        if (settings.oneEventPerDay && selectedDaysEvents.every(e => e === type)) {
            // If only one event per day and same type, remove event and don't recreate one
            for (const day of selection.selectedDays) {
                const date = dates.toString(day);

                // Edit all calendars or only selected one
                let $events;
                if ($('.calendars-wrap').hasClass('edit-all')) {
                    $events = $(`.day[data-date="${date}"] .event`);
                } else {
                    $events = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event, .calendar-wrap .day[data-date="${date}"] .event`);
                }

                $events.remove();
            }
        } else {
            const action = {
                type: 'addEvents',
                events: []
            };
    
            for (const day of selection.selectedDays) {
                const date = dates.toString(day);

                // Edit all calendars or only selected one
                let $events;
                if ($('.calendars-wrap').hasClass('edit-all')) {
                    $events = $(`.day[data-date="${date}"] .event`);
                } else {
                    $events = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event, .calendar-wrap .day[data-date="${date}"] .event`);
                }

                // Remove existing event if one event per day only
                if (settings.oneEventPerDay) $events.remove();
                    
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

        stats.update();
    },

    buildEvent(event) {
        const getEventsWrap = (day) => {
            const date = dates.toString(new Date(day));
            let $el;
            if ($('.calendars-wrap').hasClass('edit-all')) {
                $el = $(`.day[data-date="${date}"] .events`);
            } else {
                $el = $(`.calendar[data-id="${event.calendar}"]`).length ? $(`.calendar[data-id="${event.calendar}"] .day[data-date="${date}"] .events`) : $(`.calendar.selected .day[data-date="${date}"] .events, .calendar-wrap .day[data-date="${date}"] .events`);
            }
            return $el;
        }

        const range = dates.range(event.start, event.end);

        // Get first available top coordinate for multi-days event
        const top = Math.max(...range.map(day => {
            for (let i = 0; i < 32; i += 1) {
                const events = getEventsWrap(day).eq(0).find('.event').toArray();
                if (events.every(ev => parseInt($(ev).css('top')) !== i * 32)) return i;
            }
        }));

        for (const day of range) {
            const $events = getEventsWrap(day);
    
            // Build classname
            let classname = '';
            if (day.valueOf() === event.start.valueOf()) classname += ' start';
            if (day.valueOf() === event.end.valueOf()) classname += ' end';

            // Add event
            $events.append(`<div data-id="${event.id}" data-type="${event.type}" class="event${classname}" style="top: ${top * 32}px; background-color: ${event.color}">${classname.includes('start') || day.getDay() === 1 ? `<span class="title${!classname.includes('start') ? ' not-linear' : ''}">${event.title}</span>` : ''}</div>`);
        }

        calendars.updateCalendarHeight();
    },

    replaceEvent(event, undo = false) {
        // Edit all calendars or only selected one
        let $el;
        if ($('.calendars-wrap').hasClass('edit-all')) {
            $el = $(`.event[data-id="${event.id}"]`);
        } else {
            $el = $(`.calendar[data-id="${event.calendar}"]`).length ? $(`.calendar[data-id="${event.calendar}"] .event[data-id="${event.id}"]`) : $(`.calendar.selected .event[data-id="${event.id}"], .calendar-wrap .event[data-id="${event.id}"]`);
        }

        let $target;
        if (!undo) $target = $(`.events-wrap ul li[data-type="${event.type}"]`);
        else $target = $(`.events-wrap ul li[data-type="${event.from}"]`);

        $el.css('background-color', $target.css('background-color'));
        $el.find('.title').text($target.find('.title').text());
        $el.attr('data-type', $target.attr('data-type'));

        stats.update();
    },

    removeEvent(event) {
        $(`.event[data-id="${event.id}"]`).remove();
        calendars.updateCalendarHeight();
        stats.update();
    },

    removeEventsByType(type) {
        // Create action for history
        const action = {
            type: 'removeEvents',
            events: []
        };

        for (const minical of $('.calendars-wrap .calendar').toArray()) {
            const $events = $(minical).find(`.event[data-type="${type}"]`);

            $events.each((id, el) => {
                const $el = $(el);

                const event = {
                    id: $el.attr('data-id'),
                    calendar: parseInt($(minical).attr('data-id')),
                    type: $el.attr('data-type'),
                    title: $el.find('.title').text(),
                    color: $el.css('background-color'),
                    start: $el.closest('.day').attr('data-date'),
                    end: $el.closest('.day').attr('data-date')
                };

                // Remove event
                events.removeEvent(event);

                // Save event in action
                action.events.push(event);
            });
        }

        // Save action in history
        history.pushAction(action);
    }
}