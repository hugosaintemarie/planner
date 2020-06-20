import calendars from './calendars';
import dates from './dates';
import events from './events';
import history from './history';

export default {
    selectedDays: [],
    clipboard: [],

    init() {
        // Click on a day in main calendar
        $(document).on('mousedown', '.calendar-wrap .day', e => {
            this.onCalendarClick(e);
        });

        // Mouse enters a day on calendar
        $(document).on('mouseenter', '.calendar-wrap .day', e => {
            if (this.selectedDays.length) this.dragSelect(e);
            // if (!event.title || !settings.spreadOnDrag) return;
            // event.end = $(e.target).closest('.day').attr('data-date');

            // buildEvent();
        });

        // $(document).on('mouseup', '.day', e => {
        //     // event = { id: event.id + 1 };
        // });
    },

    onCalendarClick(e) {
        const $day = $(e.target).closest('.day');
        const date = $day.attr('data-date');

        if (e.metaKey && !e.shiftKey && !e.altKey) {
            $('.selected-first').removeClass('selected-first');
            $day.addClass('selected-first');

            if (dates.isInArray(this.selectedDays, new Date(date))) {
                this.selectedDays = this.selectedDays.filter(d => d.getTime() !== new Date(date).getTime());
            } else {
                this.selectedDays.push(new Date(date));
            }
        } else if (e.shiftKey) {
            const $selectedFirst = $('.calendar-wrap .day.selected-first').length ? $('.calendar-wrap .day.selected-first') : $('.calendar-wrap .day.selected').eq(0);
            $selectedFirst.addClass('selected-first');

            const _selectedDays = [new Date($selectedFirst.attr('data-date')), new Date(date)];

            const lowestWeekDay = Math.min(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
            const highestWeekDay = Math.max(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));

            const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date($day.attr('data-date'))].sort((a, b) => a > b ? 1 : -1);

            start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
            end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
            
            let days = dates.range(start, end);

            // Filter out days out of rectangle
            days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);

            if (e.metaKey) this.selectedDays.push(...days);
            else this.selectedDays = days;
        } else if (e.altKey) {
            const $selectedFirst = $('.calendar-wrap .day.selected-first').length ? $('.calendar-wrap .day.selected-first') : $('.calendar-wrap .day.selected').eq(0);
            $selectedFirst.addClass('selected-first');

            const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date($day.attr('data-date'))].sort((a, b) => a > b ? 1 : -1);

            const days = dates.range(start, end);

            if (e.metaKey) this.selectedDays.push(...days);
            else this.selectedDays = days;
        } else {
            if (this.selectedDays.length && this.selectedDays[0].getTime() === new Date(date).getTime()) {
                this.selectedDays = []; 
            } else {
                this.selectedDays = [new Date(date)]; 
                $('.calendar-wrap .day.selected-first').removeClass('selected-first');
                $('.calendar-wrap .day.selected-last').removeClass('selected-last');
                $day.addClass('selected-first selected-last');
            }
        }

        this.highlightSelection();
    },

    dragSelect(e) {
        if (e.which !== 1) return;

        const $day = $(e.target).closest('.day');
        const date = $day.attr('data-date');

        const $selectedFirst = $('.calendar-wrap .day.selected-first').length ? $('.calendar-wrap .day.selected-first') : $('.calendar-wrap .day.selected').eq(0);
        $selectedFirst.addClass('selected-first');


        let days = [];

        if (e.metaKey) {
            this.selectedDays.push(new Date(date));
        } else {
            const _selectedDays = [new Date($selectedFirst.attr('data-date')), new Date(date)];

            const lowestWeekDay = Math.min(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
            const highestWeekDay = Math.max(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
        
            const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date($day.attr('data-date'))].sort((a, b) => a > b ? 1 : -1);
            
            start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
            end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
            
            days = dates.range(start, end);
        
            // Filter out days out of rectangle
            if (!e.altKey) days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);
        }   

        if (!$selectedFirst.hasClass('selected')) {
            const date = $day.attr('data-date');
            this.selectedDays = this.selectedDays.filter(d => d.getTime() !== new Date(date).getTime());
        } else {
            if (e.metaKey) this.selectedDays.push(...days);
            else this.selectedDays = days;
        }

        this.highlightSelection();
    },

    moveSelection(e) {
        // Ignore if no selection
        const $selected = $('.calendar-wrap .day.selected-last');
        if (!$selected.length) return;
    
        let target;
        const date = new Date($selected.attr('data-date'));
    
        if (e.which === 37) {
            if (e.metaKey) {
                // Meta + left: beginning of week
                target = dates.relativeFirstWeekDay(date);
            } else {
                // Left: one day before
                target = new Date(date.setDate(date.getDate() - 1));
        
                // Prevent changing week with shift key
                if (target.getDay() === 0 && e.shiftKey) return;
            }
        } else if (e.which === 38) {
            // Up: one week before
            target = new Date(date.setDate(date.getDate() - 7));
        } else if (e.which === 39) {
            if (e.metaKey) {
                // Meta + right: end of week
                target = new Date(date.setDate(date.getDay() === 0 ? date.getDate() : (date.getDate() + 7 - date.getDay())));
            } else {
                // Right: one day after
                target = new Date(date.setDate(date.getDate() + 1));
        
                // Prevent changing week with shift key
                if (target.getDay() === 1 && e.shiftKey) return;
            }
        } else if (e.which === 40) {
            // Down: one week after
            target = new Date(date.setDate(date.getDate() + 7));
        }
    
        if (e.shiftKey) {
            const $selectedFirst = $('.selected-first');
            $('.selected-last').removeClass('selected-last');
    
            const targetDate = dates.toString(target);
            const $target = $(`.calendar-wrap .day[data-date="${targetDate}"]`);
            $target.addClass('selected-last');
    
            this.selectedDays = [new Date($selectedFirst.attr('data-date')), new Date(targetDate)];
    
            const lowestWeekDay = Math.min(...this.selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
            const highestWeekDay = Math.max(...this.selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
    
            const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date(target)].sort((a, b) => a > b ? 1 : -1);
    
            start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
            end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
            
            let days = dates.range(start, end);
    
            // Filter out days out of rectangle
            days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);
    
            this.selectedDays = days;
        } else if (e.altKey) {
            const $selectedFirst = $('.selected-first');
            $('.selected-last').removeClass('selected-last');
    
            const targetDate = dates.toString(target);
            const $target = $(`.calendar-wrap .day[data-date="${targetDate}"]`);
            $target.addClass('selected-last');
    
            const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date(target)].sort((a, b) => a > b ? 1 : -1);
    
            const days = dates.range(start, end);
    
            this.selectedDays = days;
        } else {
            const date = dates.toString(target);
            const $target = $(`.calendar-wrap .day[data-date="${date}"]`);
            $('.selected-first').removeClass('selected-first');
            $('.selected-last').removeClass('selected-last');
            $target.addClass('selected-first selected-last');
            
            this.selectedDays = [target];
        }
    
        this.highlightSelection();
    },

    emptySelection() {
        // Create action for history
        const action = {
            type: 'removeEvents',
            events: []
        };
    
        for (const day of this.selectedDays) {
            const date = dates.toString(day);
            const $event = $(`.calendar-wrap .day[data-date="${date}"] .event`);
            if (!$event.length) continue;

            // Save event in action
            const event = {
                id: events.eventID++,
                calendar: parseInt($('.calendars-wrap .calendar.selected').attr('data-id')),
                type: $event.attr('data-type'),
                title: $event.find('.title').text(),
                color: $event.css('background-color'),
                start: date,
                end: date
            };
    
            action.events.push(event);

            // Remove event from main calendar
            $event.remove();
    
            // Remove event from thumbnail calendar
            $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event`).remove();
        }
    
        // Save action in history
        history.pushAction(action);

        calendars.updateCalendarHeight();
    },
    
    selectAll() {
        const start = new Date($('#start').val());
        const end = new Date($('#end').val());

        this.selectedDays = dates.range(start, end);

        this.highlightSelection();
    },
        
    copySelection() {
        this.clipboard = [];
    
        // Find selection's bounding rectangle
        let start = new Date(Math.min(...this.selectedDays));
        let end = new Date(Math.max(...this.selectedDays));

        const lowestWeekDay = dates.findLowestWeekDay(this.selectedDays);
        const highestWeekDay = dates.findHighestWeekDay(this.selectedDays);
    
        start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
        end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
    
        // Create range from start to end of bounding rectangle
        let days = dates.range(start, end);
    
        // Filter out days out of bounding rectangle
        days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);
    
        // Create array of events for selected days, keep null for an empty day
        const events = [];
        for (const day of days) {
            // Ignore unselected days
            if (!dates.isInArray(this.selectedDays, day)) {
                events.push(null);
                continue;
            };
    
            const date = dates.toString(day);
            const $events = $(`.calendar-wrap .day[data-date="${date}"] .event`);
    
            // Copy day events to clipboard
            if ($events.length) {
                $events.each((id, el) => {
                    const $el = $(el);
        
                    const event = {
                        // id: 
                        type: $el.attr('data-type'),
                        title: $el.find('.title').text(),
                        color: $el.css('background-color'),
                        // start: $el.attr('data-start'),
                        // end: $el.attr('data-end')
                    }
        
                    events.push(event);
                });
            } else {
                events.push(null);
            }
        }
    
        // Convert 1D array of events to 2D array to mimic selection bounding rectangle layout
        while (events.length) this.clipboard.push(events.splice(0, highestWeekDay - lowestWeekDay + 1));
    },
    
    cutSelection() {
        this.copySelection();
        this.emptySelection();
    },
    
    pasteSelection() {
        // Clipboard paste starts at selected day
        const $selected = $('.calendar-wrap .day.selected-first');
        const date = new Date($selected.attr('data-date'));
    
        for (let j = 0; j < this.clipboard.length; j += 1) {
            for (let i = 0; i < this.clipboard[0].length; i += 1) {
                // Find event in clipboard if any
                const _event = this.clipboard[j][i];
                if (!_event) continue;
    
                // Find target day
                const target = new Date(new Date(date).setDate(date.getDate() + j * 7 + i));
                const _date = dates.toString(target);
    
                // Create event
                const event = { ..._event };
                event.start = _date;
                event.end = _date;
        
                events.buildEvent(event);
            }
        }
    },

    highlightSelection() {
        // Reset all currently selected days
        $('.day.selected').removeClass('selected no-top no-right no-bottom no-left');

        for (const day of this.selectedDays) {
            const date = dates.toString(day);
            const $el = $(`.day[data-date="${date}"]`);

            // Select day
            $el.addClass('selected');
            
            // Add styles classes (for borders)
            const dayBeforeSelected = dates.isInArray(this.selectedDays, dates.relativeDate(day, -1));
            const dayAfterSelected = dates.isInArray(this.selectedDays, dates.relativeDate(day, 1));
            const dayWeekBeforeSelected = dates.isInArray(this.selectedDays, dates.relativeDate(day, -7));
            const dayWeekAfterSelected = dates.isInArray(this.selectedDays, dates.relativeDate(day, 7));

            if (dayWeekBeforeSelected) $el.addClass('no-top');
            if (dayAfterSelected && day.getDay() !== 0) $el.addClass('no-right');
            if (dayWeekAfterSelected) $el.addClass('no-bottom');
            if (dayBeforeSelected && day.getDay() !== 1) $el.addClass('no-left');
        }
    }
}