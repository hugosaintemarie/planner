import calendars from './calendars';
import dates from './dates';
import selection from './selection';

export default {
    calendarID: 0,

    init() {
        // Update calendars start and end
        $(document).on('change', '#start, #end', () => {
            const calendar = this.buildCalendar();

            $('.calendar-wrap .content').html(calendar);
            $('.calendars-wrap .calendar .content').html(calendar);
        });

        // Switch calendar
        $(document).on('mousedown', '.calendars-wrap .calendar .content', e => {
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
        });

        // Duplicate calendar
        $(document).on('click', '.calendar .tools [data-tool="duplicate"]', e => {
            const $calendar = $(e.target).closest('.calendar')
            calendars.duplicateCalendar($calendar);
        });

        // Delete calendar
        $(document).on('click', '.calendar .tools [data-tool="delete"]', e => {
            const $calendar = $(e.target).closest('.calendar');
            calendars.deleteCalendar($calendar);
        });
        
        // Initiate with first calendar
        const calendar = this.buildCalendar();
        $('.calendar-wrap .content').html(calendar);
        $('.calendars-wrap .calendar .content').html(calendar);
    },

    buildCalendar() {
        // Get start and end dates
        const start = new Date(new Date($('#start').val()).setHours(0));
        const end = new Date(new Date($('#end').val()).setHours(0));
        if (end < start) return;
    
        // Find first week day
        const first = dates.relativeFirstWeekDay(start);

        // Create range from first day to end
        const days = dates.range(first, end);
    
        // Fill last week
        while (days.length % 7 !== 0) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));
    
        // Build HTML
        let html = '<div>';
        for (const day of days) {
            const date = dates.toString(day);
            day.setHours(0);

            // Show day cell as out of bounds if necessary
            const classname = day < start || day > end ? ' out' : '';
    
            html += `<div class="day${classname}" data-date="${date}"><span>${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short' })}</span><div class="events"></div></div>`;
    
            if (day.getDay() === 0) html += '</div><div>';
        }
        html += '</div>';
    
        return html;
    },

    newCalendar() {
        // Create HTML
        const calendar = `<div class="calendar sortable" data-id="${++this.calendarID}">
            <div class="tools">
                <i data-tool="toggle" class="far fa-eye"></i>
                <i data-tool="sort">⋮⋮</i>
                <i data-tool="duplicate" class="far fa-clone"></i>
                <i data-tool="delete" class="far fa-trash-alt"></i>
            </div>
            <div class="content">${ this.buildCalendar() }</div>
            <p><span contenteditable spellcheck="false">Calendar ${$('.calendars-wrap .calendar').length + 1}</span></p>
        </div>`;
        
        $('.calendars-wrap .calendars').append(calendar);

        // Select new calendar
        const $calendar = $('.calendars-wrap .calendar:last-child');
        this.selectCalendar($calendar);
    },

    duplicateCalendar($calendar) {
        const $new = $calendar.clone();

        // Remove selected class and rename with 'copy'
        $new.removeClass('selected');
        $new.find('p span').append(' copy');

        // Reindex new calendar
        $new.attr('data-id', ++this.calendarID);

        // Clone calendar
        $calendar.after($new);

        // Unselect any selection
        window.getSelection().removeAllRanges();
    },

    selectCalendar($calendar) {
        const $selectedFirst = $('.selected-first');
        const $selectedLast = $('.selected-last');

        $('.calendars-wrap .calendar.selected').removeClass('selected');
        $calendar.addClass('selected');
    
        // Update ID
        $('.calendar-wrap .content').attr('data-id', $calendar.attr('data-id'));
    
        // Update title
        $('.calendar-wrap h2').html($calendar.find('p span').html());
    
        // Update main calendar
        $('.calendar-wrap .content').html($calendar.find('.content').html());
    
        // Unselect any selection
        window.getSelection().removeAllRanges();
    
        selection.highlightSelection();

        // Restore .selected-first and .selected-last classes
        $(`.calendar-wrap .day[data-date="${$selectedFirst.attr('data-date')}"]`).addClass('selected-first');
        $(`.calendar-wrap .day[data-date="${$selectedLast.attr('data-date')}"]`).addClass('selected-last');
    },

    renameCalendar(val, $calendar = null) {
        if ($calendar) {
            // Edited in sidebar, replace in main
            if ($calendar.hasClass('selected')) {
                $('.calendar-wrap h2').text(val);
            }
        } else {
            // Edited in main, replace in sidebar
            $('.calendars-wrap .calendar.selected p span').text(val);
        }
    },

    toggleCalendar($calendar) {
        $calendar.toggleClass('hidden');
        this.selectAnotherCalendar($calendar);
    },

    deleteCalendar($calendar) {
        this.selectAnotherCalendar($calendar);
        $calendar.remove();
    },

    selectAnotherCalendar($calendar) {
        // Select next (or previous) visible calendar
        if ($calendar.hasClass('selected')) {
            const $calendarToSelect = $calendar.nextAll(':not(.hidden)').eq(0).length ? $calendar.nextAll(':not(.hidden)').eq(0) : $calendar.prevAll(':not(.hidden)').length ? $calendar.prevAll(':not(.hidden)').eq(0) : null;
            if ($calendarToSelect) this.selectCalendar($calendarToSelect);
        }
    },

    updateCalendarHeight() {
        const mostEventsPerDay = Math.max(...$('.calendar-wrap .day .events').map((id, el) => $(el).find('.event').length));
        $('.calendar-wrap .day').css('height', `${Math.max(40 + mostEventsPerDay * 32, 72)}px`);
    }
}