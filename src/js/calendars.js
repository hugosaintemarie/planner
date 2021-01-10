import calendars from './calendars';
import data from './data';
import dates from './dates';
import events from './events';
import selection from './selection';
import stats from './stats';
import tooltip from './tooltip';
import ui from './ui';

export default {
    all: [],
    calendarID: -1,
    selected: 0,
    start: null,
    end: null,
    editAll: false,

    reset() {
        this.all = [];
        this.calendarID = -1;
        this.selected = 0;
        this.start = null;
        this.end = null;
        this.shownStart = null;
        this.shownEnd = null;

        $('.calendars-wrap .calendars').empty();
        $('.calendar-wrap .calendars .content').empty();
    },

    init() {
        // Update calendars start and end
        $(document).on('change', '#start, #end', () => {
            this.updateCalendars();
            data.save();
        });

        // Switch calendar
        $(document).on('click', '.calendars-wrap .calendar:not(.selected)', e => {
            const $calendar = $(e.target).closest('.calendar');
            calendars.selectCalendar($calendar);
        });

        // Add new calendar
        $(document).on('click', '.calendars-wrap .add', () => {
            calendars.newCalendar();
        });

        // Rename calendar in sidebar
        $(document).on('input', '.calendars-wrap p span', e => {
            const $calendar = $(e.target).closest('.calendar');
            const val = $(e.target).text();
            calendars.renameCalendar(val, $calendar);
        });

        // Rename selected calendar
        $(document).on('input', '.calendar-wrap h2', e => {
            const val = $(e.target).text();
            calendars.renameCalendar(val);
        });

        // Toggle calendar visibility
        $(document).on('click', '.calendars-wrap [data-tool="toggle"]', e => {
            const $calendar = $(e.target).closest('.calendar');
            calendars.toggleCalendar($calendar);
            return false;
        });

        // Duplicate calendar
        $(document).on('click', '.calendar .tools [data-tool="duplicate"]', e => {
            const $calendar = $(e.target).closest('.calendar');
            calendars.duplicateCalendar($calendar);
            return false;
        });

        // Delete calendar
        $(document).on('click', '.calendar .tools [data-tool="delete"]', e => {
            const $calendar = $(e.target).closest('.calendar');
            calendars.deleteCalendar($calendar);
            return false;
        });

        // Toggle edit all
        $(document).on('click', '.toggle-edit-all', () => {
            $('nav [data-tool="edit-all"]').toggleClass('checked');
            $('.calendars-wrap').toggleClass('edit-all');
            
            if ($('.calendars-wrap').is('.edit-all')) this.editAll = true;
            else this.editAll = false;
        });

        this.buildCalendarHead();
    },

    // Get start and end dates
    getStartEnd() {
        this.start = new Date(new Date($('#start').val()).setHours(0));
        this.end = new Date(new Date($('#end').val()).setHours(0));
    },

    buildCalendarHead() {
        const days = ['Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays', 'Sundays'];
        const headFull = `<div>${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) =>
            `<div data-day="${i === 6 ? 0 : i + 1}">
                ${d}<i class="fas fa-chevron-down"></i>
                <div class="dropdown">
                    <span data-tool="select-weekday"><i class="fas fa-plus"></i>Select ${days[i]}</span>
                    <span class="border-top" data-tool="hide-weekday"><i class="fas fa-eye-slash"></i>Hide column</span>
                </div>
            </div>`
        ).join('')}</div>`;

        $('.head.full').html(headFull);

        this.getStartEnd();
        const range = dates.range(this.start, this.end);

        const months = range.reduce((acc, curr) => {
            const month = `${curr.getMonth()}-${curr.getFullYear()}`;
            if (!acc[month]) acc[month] = 1;
            else acc[month] += 1;
            return acc;
        }, {});

        let headLinear = `<div class="months">${Object.keys(months).map(d => `<div style="width: ${139 * months[d]}px"><div class="title"><span>${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(d.split('-')[0])]}</span><span class="year">${d.split('-')[1]}</span></div></div>`).join('')}</div>`;

        headLinear += `<div>${range.map(day =>
            `<div data-day="${day.getDay()}">${day.toLocaleDateString('en-US', { weekday: 'short' })} ${day.getDate()}</div>`
        ).join('')}</div>`;

        $('.head.linear').html(headLinear);
    },
    
    buildCalendar() {
        if (this.end < this.start) return;
    
        // Find first week day
        const first = dates.relativeFirstWeekDay(this.start);
        this.shownStart = first;

        // Create range from first day to end
        const days = dates.range(first, this.end);
    
        // Fill last week
        while (days.length % 7 !== 0) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

        this.shownEnd = days[days.length - 1];

        // Convert days 1D array to weeks 2D array
        const weeks = dates.toWeeksArray(days);

        // Build HTML
        let html = '';
        for (const week of weeks) {
            html += '<div>';
            for (const day of week) html += this.buildDayHTML(day);
            html += '</div>';
        }
    
        return html;
    },

    buildDayHTML(day) {
        const date = dates.toString(day);
        day.setHours(0);

        // Show day cell as out of bounds if necessary
        let classname = day < this.start || day > this.end ? ' out' : '';
        if (day.getDay() === 6 || day.getDay() === 0) classname += ' off';

        const html = `<div class="day${classname}" data-day="${day.getDay()}" data-date="${date}"><span>${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short' })}</span><div class="events"></div></div>`;

        return html;
    },

    updateCalendars() {
        let toAdd = [];
        let toDelete = [];
        let toSetIn = [];
        let toSetOut = [];

        const oldStart = this.start;
        const oldEnd = this.end;
        this.getStartEnd();
        const start = this.start;
        const end = this.end;

        const oldFirst = dates.relativeFirstWeekDay(oldStart);
        const first = dates.relativeFirstWeekDay(start);
        const oldLast = dates.relativeLastWeekDay(oldEnd);
        const last = dates.relativeLastWeekDay(end);

        if (oldStart < start) {
            toDelete.push(...dates.range(oldFirst, dates.relativeDate(first, -1)));
            toSetOut.push(...dates.range(first, dates.relativeDate(start, -1)));
        } else if (oldStart > start) {
            toAdd.push(...dates.range(first, dates.relativeDate(oldFirst, -1)));
            toSetIn.push(...dates.range(start, dates.relativeDate(oldStart, -1)));
        }

        if (oldEnd < end) {
            toAdd.push(...dates.range(dates.relativeDate(oldLast, 1), last));
            toSetIn.push(...dates.range(dates.relativeDate(oldEnd, 1), end));
        } else if (oldEnd > end) {
            toDelete.push(...dates.range(dates.relativeDate(last, 1), oldLast));
            toSetOut.push(...dates.range(dates.relativeDate(end, 1), last));
        }

        // Add new days
        if (toAdd.length > 1) {
            const weeks = dates.toWeeksArray(toAdd);

            let html = '';
            for (const week of weeks) {
                html += '<div>';

                for (const day of week) {
                    const date = dates.toString(day);
                    html += this.buildDayHTML(day);
                }

                html += '</div>';
            }

            if (oldStart > start) $('.calendar.content, .calendar > .content').prepend(html);
            else if (oldEnd < end) $('.calendar.content, .calendar > .content').append(html);

            this.updateCalendarHeight();
        }

        // Remove 'out' class for days that are now in scope
        for (const day of toSetIn) {
            const date = dates.toString(day);
            $(`.day[data-date="${date}"]`).removeClass('out');
        }

        // Delete excessive days
        if (toDelete.length >= 7) {
            for (const day of toDelete) {
                const date = dates.toString(day);
                $(`.day[data-date="${date}"]`).remove();
            }
        }

        // Set out remaining out-of-scope days
        for (const day of toSetOut) { 
            const date = dates.toString(day);
            $(`.day[data-date="${date}"]`).addClass('out');
        }

        this.buildCalendarHead();
    },

    newCalendar(calendar) {
        const id = calendar ? calendar.id : ++this.calendarID;
        const title = calendar ? calendar.title : `Calendar ${$('.calendars-wrap .calendar').length + 1}`;
        const order = calendar ? calendar.order : $('.calendars-wrap .calendar').length;
        const description = calendar ? calendar.description : 'Add a description';

        // Create HTML
        const html = `<div class="calendar sortable" data-id="${id}">
            <div class="tools">
                <i data-tool="toggle" class="far fa-eye" data-tooltip="Hide<span class='shortcut'>⌘H</span>" data-tooltip-side="right"></i>
                <i data-tool="sort" data-tooltip="Sort" data-tooltip-side="right">⋮⋮</i>
                <i data-tool="duplicate" class="far fa-clone" data-tooltip="Duplicate<span class='shortcut'>⌘D</span>" data-tooltip-side="right"></i>
                <i data-tool="delete" class="far fa-trash-alt" data-tooltip="Delete<span class='shortcut'>⌘⌫</span>" data-tooltip-side="right"></i>
            </div>
            <div class="content">${ this.buildCalendar() }</div>
            <p><span contenteditable spellcheck="false">${title}</span></p>
        </div>`;
        
        let $calendar;
        if (order) {
            $('.calendars-wrap .calendar').eq(order - 1).after(html);
            $calendar = $('.calendars-wrap .calendar').eq(order);
        } else {
            $('.calendars-wrap .calendars').append(html);
            $calendar = $('.calendars-wrap .calendar:last-child');
        }

        // Select new calendar
        this.selectCalendar($calendar);

        // Update linear view
        if (ui.viewIs('linear')) ui.linearView();

        // Save data
        this.all.push({
            id,
            title,
            description,
            order,
            events: []
        });

        // Build events (for calendar duplication)
        if (calendar && calendar.events) {
            for (const event of calendar.events) {
                events.buildEvent({
                    ...event,
                    calendar: id
                });
            }
        }

        data.save();
    },

    duplicateCalendar($calendar) {
        const calendar = {
            id: ++this.calendarID,
            title: `${$calendar.find('p span').text()} copy`,
            order: $calendar.index() + 1,
            events: this.getEventsById(parseInt($calendar.attr('data-id'))).map(d => ({...d, id: ++events.eventID })) // Reindex all events
        };

        this.newCalendar(calendar);

        // Unselect any selection
        window.getSelection().removeAllRanges();

        if (ui.viewIs('linear')) ui.linearView();

        data.save();
    },

    selectCalendar($calendar, selectedFirst, selectedLast) {
        this.selected = parseInt($calendar.attr('data-id'));

        // Store .selected-first and .selected-last dates if not passed
        if (!selectedFirst) selectedFirst = $('.selected-first').attr('data-date');
        if (!selectedLast) selectedLast = $('.selected-last').attr('data-date');

        // Update minicals UI
        $('.calendars-wrap .calendar.selected').removeClass('selected');
        $calendar.addClass('selected');

        if (ui.viewIs('linear')) {
            // Select calendar
            $('.calendar-wrap .calendar.selected').removeClass('selected');
            $(`.calendar-wrap .calendar[data-id="${$calendar.attr('data-id')}"]`).addClass('selected');
        } else {
            // Update ID
            $('.calendar-wrap .content').attr('data-id', $calendar.attr('data-id'));
        
            // Update title
            $('.calendar-wrap .title h2').html($calendar.find('p span').html());
            $('.calendar-wrap .title span').html(this.all?.find(d => d.id === this.selected)?.description);
        
            // Update main calendar
            $('.calendar-wrap .content').html($calendar.find('.content').html()).addClass('selected');
        }

        // Unselect any selection
        window.getSelection().removeAllRanges();
    
        selection.highlightSelection();

        // Restore .selected-first and .selected-last classes
        $('.selected-first, .selected-last').removeClass('selected-first selected-last');
        $(`.calendar-wrap .calendar.selected .day[data-date="${selectedFirst}"]`).addClass('selected-first');
        $(`.calendar-wrap .calendar.selected .day[data-date="${selectedLast}"]`).addClass('selected-last');

        this.updateCalendarHeight();
        stats.update();
        data.save();
    },

    getSelectedCalendars() {
        if (this.editAll) return Object.values(this.all).map(d => d.id);
        else return [this.selected];
    },

    renameCalendar(val, $calendar = null) {
        let id;
        if ($calendar) {
            // Edited in sidebar, replace in main
            if ($calendar.hasClass('selected')) {
                $('.calendar-wrap h2').text(val);
            }
            id = parseInt($calendar.attr('data-id'));
        } else {
            // Edited in main, replace in sidebar
            $('.calendars-wrap .calendar.selected p span').text(val);
            id = parseInt($('.calendars-wrap .calendar.selected').attr('data-id'));
        }

        // Save data
        this.all.find(c => c.id === id).title = val;
        data.save();
    },

    toggleCalendar($calendar) {
        $calendar.toggleClass('hidden');

        if (ui.viewIs('linear')) {
            $calendar.css('transition', 'none');
            $(`.calendar-wrap .calendar[data-id="${$calendar.attr('data-id')}"]`).toggleClass('hidden').find('.day').css('transition', 'none');
            setTimeout(() => {
                $calendar.css('transition', '');
                $(`.calendar-wrap .calendar[data-id="${$calendar.attr('data-id')}"] .day`).css('transition', '');
            }, 500);
        }

        this.selectAnotherCalendar($calendar);
    },

    deleteCalendar($calendar) {
        this.selectAnotherCalendar($calendar);
        $calendar.remove();

        if (ui.viewIs('linear')) ui.linearView();

        // Update data
        const calendar = this.all.find(e => e.id === parseInt($calendar.attr('data-id')));
        this.all.splice(this.all.indexOf(calendar), 1);

        this.reorder();
        data.save();

        tooltip.hide();
    },

    selectPreviousCalendar() {
        // Find selected calendar
        let $calendar = $('.calendars-wrap .calendar.selected');

        // Unselect it
        $calendar.removeClass('selected');

        // Select previous visible calendar
        if ($calendar.prevAll('.calendar:not(.hidden)').length) $calendar = $calendar.prevAll('.calendar:not(.hidden)').eq(0)

        // Else, select last visible calendar
        else $calendar = $('.calendars-wrap .calendar:not(.hidden)').last();

        this.selectCalendar($calendar);
    },

    selectNextCalendar() {
        // Find selected calendar
        let $calendar = $('.calendars-wrap .calendar.selected');

        // Unselect it
        $calendar.removeClass('selected');

        // Select next visible calendar
        if ($calendar.nextAll('.calendar:not(.hidden)').length) $calendar = $calendar.nextAll('.calendar:not(.hidden)').eq(0);

        // Else, select first visible calendar
        else $calendar = $('.calendars-wrap .calendar:not(.hidden)').first();

        this.selectCalendar($calendar);
    },

    selectFirstCalendar() {
        const $calendar = $('.calendars-wrap .calendar').eq(0);
        this.selectCalendar($calendar);
    },

    selectAnotherCalendar($calendar) {
        // Select next (or previous) visible calendar
        if ($calendar.hasClass('selected')) {
            const $calendarToSelect = $calendar.nextAll(':not(.hidden)').eq(0).length ? $calendar.nextAll(':not(.hidden)').eq(0) : $calendar.prevAll(':not(.hidden)').length ? $calendar.prevAll(':not(.hidden)').eq(0) : null;
            if ($calendarToSelect) this.selectCalendar($calendarToSelect);
        }
    },

    getCalendarHeight() {
        let height = Math.max(...$('.calendar-wrap .event').map((_, el) => parseInt($(el).css('top')))) + 68;
        if (!isFinite(height)) height = 68;
        return height;
    },

    updateCalendarHeight(height) {
        if (!height) height = this.getCalendarHeight();

        $('.calendar-wrap .day').css('height', `${height}px`);
        
        if (ui.viewIs('linear')) $('.calendars-wrap .calendar').css('height', `${height}px`);
        else $('.calendars-wrap .calendar').css('height', '');
    },

    getEventsById(id) {
        return this.all.find(c => c.id === id).events;
    },

    reorder() {
        // Update linear view
        if (ui.viewIs('linear')) ui.linearView();

        this.all.forEach(c => c.order = parseInt($(`.calendars-wrap .calendar[data-id="${c.id}"]`).attr('data-order')));
    }
}