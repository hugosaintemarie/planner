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
            
            if (!e.altKey) {
                // Rectangle mode, move start date to top left corner and end date to bottom right corner
                start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
                end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
            }
            
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
                target = dates.relativeDate(date, -1);
        
                // Prevent changing week with shift key
                if (target.getDay() === 0 && e.shiftKey) return;
            }
        } else if (e.which === 38) {
            // Up: one week before
            target = dates.relativeDate(date, -7);
        } else if (e.which === 39) {
            if (e.metaKey) {
                // Meta + right: end of week
                target = dates.relativeLastWeekDay(date);
            } else {
                // Right: one day after
                target = dates.relativeDate(date, 1);
        
                // Prevent changing week with shift key
                if (target.getDay() === 1 && e.shiftKey) return;
            }
        } else if (e.which === 40) {
            // Down: one week after
            target = dates.relativeDate(date, 7);
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
            const diff = target - date;

            // Move .selected-first and .selected-last classes
            const $sF = $('.selected-first');
            const dateSF = new Date($sF.attr('data-date'));
            dateSF.setTime(dateSF.getTime() + diff);
            $sF.removeClass('selected-first');
            $(`.calendar-wrap .day[data-date=${dates.toString(dateSF)}]`).addClass('selected-first');

            const $sL = $('.selected-last');
            const dateSL = new Date($sL.attr('data-date'));
            dateSL.setTime(dateSL.getTime() + diff);
            $sL.removeClass('selected-last');
            $(`.calendar-wrap .day[data-date=${dates.toString(dateSL)}]`).addClass('selected-last');

            // For each already selected day, move by diff between first selected day and target
            this.selectedDays = this.selectedDays.map(date => new Date(date.getTime() + diff));
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
            let $events;
            if ($('.calendars-wrap').hasClass('edit-all')) {
                $events = $(`.calendars-wrap .day[data-date="${date}"] .event`);
            } else {
                $events = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event`);
            }
            if (!$events.length) continue;
    
            // Save events in action
            $events.each((id, el) => {
                const $el = $(el);
    
                const event = {
                    id: events.eventID++,
                    calendar: parseInt($el.parents('.calendar').attr('data-id')),
                    type: $el.attr('data-type'),
                    title: $el.find('.title').text(),
                    color: $el.css('background-color'),
                    start: date,
                    end: date
                };

                action.events.push(event);
            });

            // Remove events from minicals
            $events.remove();
    
            // Remove events from main calendar
            $(`.calendar-wrap .day[data-date="${date}"] .event`).remove();
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

    narrowSelection() {
        const $onlySelectedDay = $('.selected-first.selected-last.selected');

        // Keep only first selected day in selection
        const $selectedFirst = $('.selected-first');
        const date = new Date($selectedFirst.attr('data-date'));

        $('.selected-last').removeClass('selected-last');
        $selectedFirst.addClass('selected-last');
        
        this.selectedDays = [date];
        this.highlightSelection();
        
        // If only one selected day, toggle it
        $onlySelectedDay.removeClass('selected');
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
            const eventsThatDay = [];

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
        
                    eventsThatDay.push(event);
                });
                events.push(eventsThatDay);

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
        // Push action in history
        const action = {
            type: 'addEvents',
            events: []
        };

        // Clipboard paste starts at selected day
        const $selected = $('.calendar-wrap .day.selected-first');
        const date = new Date($selected.attr('data-date'));
    
        for (let j = 0; j < this.clipboard.length; j += 1) {
            for (let i = 0; i < this.clipboard[0].length; i += 1) {
                // Find event in clipboard if any
                const eventsThatDay = this.clipboard[j][i];
                if (!eventsThatDay) continue;

                for (const _event of eventsThatDay) {
                    // Find target day
                    const target = new Date(new Date(date).setDate(date.getDate() + j * 7 + i));
                    const eventDate = dates.toString(target);

                    // Create event
                    const event = {
                        ..._event,
                        id: events.eventID++,
                        start: eventDate,
                        end: eventDate
                    };
            
                    // Build event
                    events.buildEvent(event);
        
                    // Save event in action
                    action.events.push(event);
                }
            }
        }

        // Save action in history
        history.pushAction(action);
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
    },

    replaceEvents(from, to) {
        // Create action for history
        const action = {
            type: 'replaceEvents',
            events: []
        };

        for (const day of this.selectedDays) {
            const date = dates.toString(day);
            const $events = $(`.calendar-wrap .day[data-date="${date}"] .event[data-type="${from}"]`);

            $events.each((id, el) => {
                const $el = $(el);

                const event = {
                    id: $el.attr('data-id'),
                    calendar: parseInt($('.calendars-wrap .calendar.selected').attr('data-id')),
                    type: to,
                    from,
                    title: $el.find('.title').text(),
                    color: $el.css('background-color'),
                    start: date,
                    end: date
                };

                // Replace event
                events.replaceEvent(event);

                // Save event in action
                action.events.push(event);
            });
        }

        // Save action in history
        history.pushAction(action);
    },

    removeEvents(type) {
        // Create action for history
        const action = {
            type: 'removeEvents',
            events: []
        };

        for (const day of this.selectedDays) {
            const date = dates.toString(day);
            const $events = $(`.calendar-wrap .day[data-date="${date}"] .event[data-type="${type}"]`);

            $events.each((id, el) => {
                const $el = $(el);

                const event = {
                    id: $el.attr('data-id'),
                    calendar: parseInt($('.calendars-wrap .calendar.selected').attr('data-id')),
                    type: $el.attr('data-type'),
                    title: $el.find('.title').text(),
                    color: $el.css('background-color'),
                    start: date,
                    end: date
                };

                // Remove event
                events.removeEvent(event);

                // Save event in action
                action.events.push(event);
            });
        }

        // Save action in history
        history.pushAction(action);
    },

    allDaysEmpty() {
        return !this.selectedDays.some(day => $(`.day[data-date="${dates.toString(day)}"] .event`).length);
    }
}