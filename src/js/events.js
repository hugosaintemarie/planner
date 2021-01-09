import calendars from './calendars';
import data from './data';
import dates from './dates';
import history from './history';
import selection from './selection';
import settings from './settings';
import stats from './stats';

export default {
    all: [],
    eventID: -1,
    type: -1,

    reset() {
        this.all = [];
        this.eventID = -1;
        this.type = -1;

        $('.events-wrap ul').empty();
        $('.stats-wrap .stats').empty();
    },

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
            const type = parseInt($event.attr('data-type'));
            this.insertEvent(type);
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
            $('[data-day].open').removeClass('open');
            $('#color-swatch').removeClass('visible');

            if ($(e.target).parents().is('[data-tool="dropdown"], .dropdown')) return;

            // Remove contenteditable attr
            $('.events-wrap ul li .title[contenteditable]').removeAttr('contenteditable');
        });

        // Save event rename on blur (for empty names)
        $(document).on('blur', '.events-wrap .title', e => {
            this.renameEvent($(e.currentTarget));
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
            $($('#color-swatch .color').toArray().find(c => $(c).attr('data-color') === $el.attr('data-color'))).addClass('selected');

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
            const eventType = parseInt($('#color-swatch').attr('data-type'));

            // Select color
            $('#color-swatch .color.selected').removeClass('selected');
            $color.addClass('selected');

            // Update event, occurences and stats
            const color = $color.attr('data-color');
            $(`.events-wrap ul li[data-type="${eventType}"], .event[data-type="${eventType}"]`).attr('data-color', color);
            $(`.stat[data-type="${eventType}"] .event-icon`).attr('data-color', color);

            // Update data
            this.all.find(e => e.type === eventType).color = parseInt($color.attr('data-color'));
            data.save();

            return false;
        });

        // Delete event
        $(document).on('click', '.events-wrap ul li [data-tool="delete"]', e => {
            const $el = $(e.target).closest('li');
            const type = parseInt($el.attr('data-type'));
            $el.remove();
            this.removeEventsByType(type);
            stats.update();

            // Update data
            const event = this.all.find(e => e.type === type);
            this.all.splice(this.all.indexOf(event), 1);
            data.save();
        });

        // Selected event
        // $(document).on('mousedown', '.events-wrap ul li', e => {
        //     const $el = $(e.currentTarget);
        //     $el.siblings('.selected').removeClass('selected');
        //     $el.toggleClass('selected');
        // });

        for (let i = 0; i <= 19; i += 1) {
            $('#color-swatch').append(`<div class="color" data-color="${i}"></div>`);
        }
    },

    newEvent(events) {
        if (!Array.isArray(events)) events = [events];

        for (const event of events) {
            this.type++;
            const type = event && !isNaN(event.type) ? event.type : this.type;
            const color = event && !isNaN(event.color) ? event.color : type;

            const li = `<li data-type="${type}" class="sortable" data-color="${color}">
                <span class="title" ${!event ? 'contenteditable' : ''} spellcheck="false">${event && event.title ? event.title : ''}</span>
                <span class="tools">
                    <i class="fas fa-angle-down" data-tool="dropdown"></i>
                    <i data-tool="sort">⋮⋮</i>
                    <span class="dropdown">
                        <span data-tool="rename"><i class="fas fa-pen"></i>Rename</span>
                        <span data-tool="color"><i class="fas fa-palette"></i>Change color</span>
                        <span class="border-top" data-tool="delete"><i class="far fa-trash-alt"></i>Delete</span>
                    </span>
                </span>
            </li>`;

            const $ul = $('.events-wrap ul');
            $ul.append(li);

            // Select new event
            // $ul.find('li.selected').removeClass('selected');
            // $ul.find('li:last-child').addClass('selected');

            // Focus span if empty
            if (!event) $ul.find('li:last-child .title').focus();

            // Save data
            this.all.push({
                ...event,
                type,
                color
            });
        }

        stats.update();
    },

    renameEvent($el) {
        const val = $el.text();
        const type = parseInt($el.closest('li').attr('data-type'));

        console.log(type);

        $(`.event[data-type="${type}"] span`).text(val);

        // Update data
        this.all.find(e => e.type === type).title = val;

        stats.update();
        data.save();
    },

    insertEvent(type) {
        const action = {
            type: 'addEvents',
            events: []
        };

        for (const day of selection.selectedDays) {
            const date = dates.toString(day);

            // let $events;
            let event;
            
            // Edit selected calendar(s)
            for (const calendarID of calendars.getSelectedCalendars()) {
                event = {
                    id: ++this.eventID,
                    calendar: calendarID,
                    type,
                    start: date,
                    end: date
                };

                action.events.push(event);
            }
            
            this.buildEvent(event);
        }

        history.pushAction(action);

        stats.update();
        data.save();
    },

    getEventsWrap(event, day) {
        const date = dates.toString(new Date(day));
        let $el;
        if (calendars.editAll) {
            $el = $(`.day[data-date="${date}"] .events`);
        } else {
            $el = $(`.calendar[data-id="${event.calendar}"]`).length ? $(`.calendar[data-id="${event.calendar}"] .day[data-date="${date}"] .events`) : $(`.calendar.selected .day[data-date="${date}"] .events, .calendar-wrap .day[data-date="${date}"] .events`);
        }
        return $el;
    },

    getEventTopCoordinate(event) {
        const range = dates.range(event.start, event.end);

        // Get first available top coordinate for multi-days event
        const top = new Array(32).fill(0).map(d => d).findIndex((_, i) => {
            return range.map(day => {
                const events = this.getEventsWrap(event, day).eq(0).find(`.event[data-id!="${event.id}"]`).toArray();
                return events.every(ev => parseInt($(ev).css('top')) !== i * 32);
            }).every(d => d);
        });

        return top;
    },

    buildEvent(event, updateHeight = true) {
        const range = dates.range(event.start, event.end);

        const top = this.getEventTopCoordinate(event);

        for (const day of range) {
            const $events = this.getEventsWrap(event, day);
    
            // Build classname
            let classname = '';
            if (day.valueOf() === new Date(event.start).valueOf()) classname += ' start';
            if (day.valueOf() === new Date(event.end).valueOf()) classname += ' end';

            let eventType;
            if (event.type === undefined) {
                eventType = { title: '', color: 17 };
                classname += ' new';
            } else {
                eventType = this.all.find(e => e.type === event.type);
            }
            
            // Find title and color from event
            const { title, color } = eventType;

            const html = `<div data-id="${event.id}" data-type="${event.type}" data-color="${color}" class="event${classname}" style="top: ${top * 32}px">
                ${classname.includes('start') || day.getDay() === 1 ? `<span class="title${!classname.includes('start') ? ' not-linear' : ''}">${title}</span>` : ''}
                ${classname.includes('start') ? '<div class="anchor anchor-start"></div>' : ''}
                ${classname.includes('end') ? '<div class="anchor anchor-end"></div>' : ''}
            </div>`;

            // Add event
            $events.append(html);
        }

        // Save data
        const { id, type, start, end } = event;
        calendars.all.find(c => c.id === event.calendar).events.push({
            id,
            type,
            start,
            end
        });

        if (updateHeight) calendars.updateCalendarHeight();
    },

    updateEvent(event, updateHeight) {
        this.removeEvent(event, updateHeight);
        this.buildEvent(event, updateHeight);
    },

    replaceEvent(event, undo = false) {
        // Edit all calendars or only selected one
        let $el;
        if (calendars.editAll) {
            $el = $(`.event[data-id="${event.id}"]`);
        } else {
            $el = $(`.calendar[data-id="${event.calendar}"]`).length ? $(`.calendar[data-id="${event.calendar}"] .event[data-id="${event.id}"]`) : $(`.calendar.selected .event[data-id="${event.id}"], .calendar-wrap .event[data-id="${event.id}"]`);
        }

        let $target;
        if (!undo) $target = $(`.events-wrap ul li[data-type="${event.type}"]`);
        else $target = $(`.events-wrap ul li[data-type="${event.from}"]`);

        $el.find('.title').text($target.find('.title').text());
        $el.attr('data-type', $target.attr('data-type'));
        $el.attr('data-color', $target.attr('data-color'));

        // Update data
        calendars.all.find(c => c.id === event.calendar).events.find(e => e.id === event.id).type = event.type;

        stats.update();
    },

    removeEvent(event, updateHeight = true) {
        $(`.event[data-id="${event.id}"]`).remove();

        const oldEvent = calendars.all.map(c => c.events).flat().find(e => e.id === event.id);
        const start = oldEvent ? Math.min(new Date(oldEvent.start), new Date(event.start)) : event.start;
        const end = oldEvent ? Math.max(new Date(oldEvent.end), new Date(event.end)) : event.end;

        // Find all events to update top coordinate for
        const range = dates.range(start, end);
        const eventIDs = new Set();

        for (const day of range) {
            const $events = this.getEventsWrap(event, day);
            $events.find('.event').each((_, el) => {
                const $el = $(el);
                const id = parseInt($el.attr('data-id'));
                eventIDs.add(id);
            });
        }

        for (const id of eventIDs) {
            const event = { id,
                start: $(`.event[data-id="${id}"].start`).eq(0).closest('.day').attr('data-date'),
                end: $(`.event[data-id="${id}"].end`).eq(0).closest('.day').attr('data-date'), 
                calendar: parseInt($(`.event[data-id="${id}"].start`).eq(0).closest('.calendar').attr('data-id'))
            };

            // Update top coordinate
            const top = this.getEventTopCoordinate(event);
            $(`.event[data-id="${id}"]`).css('top', top * 32);
        }

        if (updateHeight) calendars.updateCalendarHeight();

        // Update data
        calendars.all.forEach(c => c.events = c.events.filter(e => e.id !== event.id));
    },

    removeEventsByType(type) {
        // Create action for history
        const action = {
            type: 'removeEvents',
            events: []
        };

        for (const minical of $('.calendars-wrap .calendar').toArray()) {
            const $events = $(minical).find(`.event[data-type="${type}"]`);

            $events.each((_, el) => {
                const $el = $(el);

                const event = {
                    id: parseInt($el.attr('data-id')),
                    calendar: parseInt($(minical).attr('data-id')),
                    type: $el.attr('data-type'),
                    // title: $el.find('.title').text(),
                    // color: $el.css('background-color'),
                    start: $el.closest('.day').attr('data-date'),
                    end: $el.closest('.day').attr('data-date')
                };

                // Remove event
                this.removeEvent(event);

                // Save event in action
                action.events.push(event);
            });
        }

        // Save action in history
        history.pushAction(action);
    },

    reorder() {
        this.all.forEach(e => e.order = parseInt($(`.events-wrap ul li[data-type="${e.type}"]`).attr('data-order')));
    }
}