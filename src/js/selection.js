import calendars from './calendars';
import data from './data';
import dates from './dates';
import events from './events';
import history from './history';
import newEvent from './newEvent';
import stats from './stats';
import ui from './ui';

export default {
    selectedDays: [],
    clipboard: [],
    lastHoveredDate: null,
    drawing: false,
    resizing: false,
    event: null,
    eventID: null,
    eventTitle: null,
    maxHeight: 0,

    init() {
        // Click on a day in main calendar
        $(document).on('mousedown', '.calendar-wrap .day', e => {
            if (ui.toolIs('draw')) {
                if (this.event) this.changeType();
                this.startDraw(e);
            }
            else if (ui.tool === 'select') this.select(e);
        });

        // Double-click on a day in main calendar
        $(document).on('dblclick', '.calendar-wrap .day', e => {
            if (ui.toolIs('draw')) {
                this.startDraw(e);
                this.draw(e);
                this.endDraw();
            }
        });

        // Release click on a day in main calendar
        $(document).on('mouseup', '.calendar-wrap .day', () => {
            if (ui.toolIs('draw')) {
                if (this.drawing) this.endDraw();
                else if (this.dragging) this.endDrag();
                else if (this.resizing) this.endResize();
            }
        });

        // Mouse enters a day in main calendar
        $(document).on('mouseenter', '.calendar-wrap .day', e => {
            const date = $(e.currentTarget).attr('data-date');
            if (this.lastHoveredDate === date) return;

            this.lastHoveredDate = date;

            if (ui.toolIs('draw')) {
                if (this.drawing) this.draw(e);
                else if (this.dragging) this.dragEvent(e);
                else if (this.resizing) this.resizeEvent(e);
            } else if (ui.tool === 'select') {    
                if (this.selectedDays.length) this.dragSelect(e);
            }
        });

        // Change new event title
        $(document).on('input', '.event.new .title', e => {
            const $el = $(e.currentTarget);
            this.renameEvent($el);
        });

        // Click on an event in main calendar
        $(document).on('mousedown', '.calendar-wrap .day .event:not(.new)', e => {
            if (ui.toolIs('draw')) return false;
        });

        // Release click on an event in main calendar
        $(document).on('mouseup', '.calendar-wrap .day .event', () => {
            if (ui.toolIs('draw') && !this.event) return false;
        });

        // Double-click on an event in main calendar
        $(document).on('dblclick', '.calendar-wrap .day .event', e => {
            if (ui.toolIs('draw')) {
                const $el = $(e.currentTarget);
                this.eventID = parseInt($el.attr('data-id'));
                
                // Abort if we're selecting multiple elements
                const count = new Set($('.event.selected').toArray().map(d => $(d).attr('data-id'))).size;
                if (count > 1 || !$el.hasClass('selected')) return false;

                const $event = $(`.calendar-wrap .event.start[data-id="${$el.attr('data-id')}"]`);
                newEvent.show($event);

                return false;
            }
        });

        // Mousedown outside calendar submits new event
        $(document).on('mousedown', '.calendar-wrap .event', e => {
            if (ui.toolIs('draw')) {
                const $event = $(e.currentTarget);

                if (this.event) this.changeType();
                else {
                    this.dragging = true;

                    const id = parseInt($event.attr('data-id'));

                    this.event = {
                        id,
                        calendar: parseInt($event.closest('.calendar').attr('data-id')),
                        type: parseInt($event.attr('data-type')),
                        start: $(`.event.start[data-id="${id}"]`).closest('.day').attr('data-date'),
                        end: $(`.event.end[data-id="${id}"]`).closest('.day').attr('data-date'),
                        dragging: $event.closest('.day').attr('data-date')
                    };
                }

                const multiSelect = e.metaKey || e.ctrlKey || e.shiftKey;
                if (!multiSelect) $('.event.selected').removeClass('selected');
                newEvent.hide();

                const id = $event.attr('data-id');
                if (!isNaN(id)) this.selectEventByID(id, true);
                return false;
            }
        });

        // Mousedown anywhere
        $(document).on('mousedown', e => {
            newEvent.hide();
            const multiSelect = e.metaKey || e.ctrlKey || e.shiftKey;
            if (multiSelect) return false;
            $('.event.selected').removeClass('selected');
        });

        $(document).on('mousedown', '.calendar-wrap .event .anchor', e => {
            newEvent.hide();
            this.resizing = true;
            
            const $anchor = $(e.currentTarget);
            const $event = $anchor.closest('.event');

            const id = parseInt($event.attr('data-id'));

            this.event = {
                id,
                calendar: parseInt($event.closest('.calendar').attr('data-id')),
                type: parseInt($event.attr('data-type')),
                start: $(`.event.start[data-id="${id}"]`).closest('.day').attr('data-date'),
                end: $(`.event.end[data-id="${id}"]`).closest('.day').attr('data-date'),
                anchor: $anchor.hasClass('anchor-start') ? 'start' : 'end'
            };

            $event.closest('.calendar').addClass('resizing');

            return false;
        });

        $(document).on('mouseup', () => {
            if (this.dragging) this.endDrag();
            else if (this.resizing) this.endResize();
        });

        $(document).on('dblclick', '.calendar-wrap .event .anchor', () => {
            return false;
        });

        this.maxHeight = calendars.getCalendarHeight();
    },

    startDraw(e) {
        this.drawing = true;

        const $day = $(e.currentTarget);
        const date = $day.attr('data-date');

        this.event = {
            id: ++events.eventID,
            calendar: parseInt($day.parents('.calendar').attr('data-id')),
            start: date,
            end: date,
            startingDate: date
        };

        this.eventID = this.event.id;
    },

    draw(e) {
        const $day = $(e.currentTarget);
        const date = $day.attr('data-date');

        if (date >= this.event.startingDate) {
            this.event.start = this.event.startingDate;
            this.event.end = date;
        } else if (date < this.event.startingDate) {
            this.event.start = date;
            this.event.end = this.event.startingDate;
        }

        events.updateEvent(this.event, false);

        this.maxHeight = Math.max(this.maxHeight, calendars.getCalendarHeight());
        calendars.updateCalendarHeight(this.maxHeight);
    },

    endDraw() {
        if (!this.event) return;
        this.drawing = false;
        
        // Find new event start
        const $event = $(`.calendar-wrap .event.new.start[data-id="${this.event.id}"]`);

        // Ignore single click
        if (!$event.length) {
            this.event = null;
            events.eventID--;
            return;
        }

        const $title = $event.find('.title');
        $title.attr('contenteditable', true).focus();

        if (events.all.length) newEvent.show($event);
    },

    cancelDraw() {
        this.event = null;
        events.eventID--;
        events.removeEvent({id: this.eventID });
        newEvent.hide();
    },

    renameEvent($el) {
        const title = $el.text();

        this.eventTitle = title;

        this.filterTypes(title);

        // Duplicate text to other title fields (event on multiple weeks)
        const id = $el.closest('.event').attr('data-id');
        $(`.event[data-id="${id}"] .title:not(:focus)`).text(title);
    },

    changeType(type) {
        let event;
        let calendar;

        if (!isNaN(this.eventID)) {
            calendar = calendars.all.find(c => c.events.some(e => e.id === this.eventID));
            event = calendar.events.find(e => e.id === this.eventID);
        } else {
            const $event = $('.calendar-wrap .event.start.selected').eq(0);
            const eventID = parseInt($event.attr('data-id'));
            calendar = calendars.all.find(c => c.events.some(e => e.id === eventID));
            event = calendar.events.find(e => e.id === eventID);
        }

        if (isNaN(type)) {
            // New event
            events.newEvent({
                title: this.eventTitle || 'New event',
                color: 17
            });
            event.type = events.type;
        } else {
            event.type = type;
        }

        event.calendar = calendar.id;
        events.updateEvent(event);

        newEvent.hide();

        this.event = null;
        this.eventID = null;

        stats.update();
        data.save();
    },

    filterTypes(title) {
        let eventsList = events.all;
        eventsList = eventsList.filter(e => e.title.toLowerCase().startsWith(title.toLowerCase()));

        if (eventsList.length) newEvent.update(eventsList);
        else newEvent.hide();
    },

    select(e) {
        const $day = $(e.currentTarget);
        const date = $day.attr('data-date');

        $('.calendar.selected').removeClass('selected');
        $(`.calendar[data-id="${$day.closest('.calendar').attr('data-id')}"]`).addClass('selected');

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

            let days = [];
            const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date($day.attr('data-date'))].sort((a, b) => a > b ? 1 : -1);

            if (ui.viewIs('full')) {
                const _selectedDays = [new Date($selectedFirst.attr('data-date')), new Date(date)];
    
                const lowestWeekDay = Math.min(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
                const highestWeekDay = Math.max(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
    
    
                start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
                end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
                
                days = dates.range(start, end);
    
                // Filter out days out of rectangle
                days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);
            } else {
                days = dates.range(start, end);
            }

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
            // if (this.selectedDays.length && this.selectedDays[0].getTime() === new Date(date).getTime()) {
            //     this.selectedDays = []; 
            // } else {
                this.selectedDays = [new Date(date)]; 
                $('.calendar-wrap .day.selected-first').removeClass('selected-first');
                $('.calendar-wrap .day.selected-last').removeClass('selected-last');
                $day.addClass('selected-first selected-last');
            // }
        }

        this.highlightSelection();
    },

    dragSelect(e) {
        if (!(e.which === 1 || e.which === 18)) return;

        let date;
        if (e.which === 18) date = this.lastHoveredDate;
        else if (e.which === 1) date = $(e.currentTarget).attr('data-date');

        const $selectedFirst = $('.calendar-wrap .day.selected-first').length ? $('.calendar-wrap .day.selected-first') : $('.calendar-wrap .day.selected').eq(0);
        $selectedFirst.addClass('selected-first');

        let days = [];

        if (e.metaKey) {
            this.selectedDays.push(new Date(date));
        } else {
            const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date(date)].sort((a, b) => a > b ? 1 : -1);

            if (ui.viewIs('full')) {
                const _selectedDays = [new Date($selectedFirst.attr('data-date')), new Date(date)];
    
                const lowestWeekDay = Math.min(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
                const highestWeekDay = Math.max(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
                
                if (!e.altKey) {
                    // Rectangle mode, move start date to top left corner and end date to bottom right corner
                    start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
                    end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
                }
                
                days = dates.range(start, end);

                // Filter out days out of rectangle
                if (!e.altKey) days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);
            } else {
                days = dates.range(start, end);
            }
        }   

        if (!$selectedFirst.hasClass('selected')) {
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
    
        // Target set to same date by default (for linear mode)
        const date = new Date($selected.attr('data-date'));
        let target = date;
    
        if (e.which === 37) {
            if (e.metaKey) { // Meta + left
                // Full: beginning of week
                if (ui.viewIs('full')) target = dates.relativeFirstWeekDay(date);

                // Linear: one week before
                else if (ui.viewIs('linear')) target = dates.relativeDate(date, -7);

            } else { // Left

                // One day before
                target = dates.relativeDate(date, -1);
                
                // Prevent changing week with shift key
                if (ui.viewIs('full') && target.getDay() === 0 && e.shiftKey) return;
            }

        } else if (e.which === 38) { // Up

            // Full: one week before
            if (ui.viewIs('full')) target = dates.relativeDate(date, -7);

            // Linear: calendar above
            else if (ui.viewIs('linear')) calendars.selectPreviousCalendar();

        } else if (e.which === 39) {
            if (e.metaKey) { // Meta + right

                // Full: end of week
                if (ui.viewIs('full')) target = dates.relativeLastWeekDay(date);

                // Linear: one week after
                else if (ui.viewIs('linear')) target = dates.relativeDate(date, 7);

            } else { // Right
                
                // One day after
                target = dates.relativeDate(date, 1);
        
                // Prevent changing week with shift key
                if (ui.viewIs('full') && target.getDay() === 1 && e.shiftKey) return;
            }

        } else if (e.which === 40) { // Down
            // Full: one week after
            if (ui.viewIs('full')) target = dates.relativeDate(date, 7);
            
            // Linear: move to calendar under
            else if (ui.viewIs('linear')) calendars.selectNextCalendar();
        }

        // TODO: check that _all_ days in selection fit in calendar?
        if (!dates.isInArray(dates.range(calendars.shownStart, calendars.shownEnd), new Date(new Date(target).setHours(0)))) return;
    
        if (e.shiftKey) {
            const $selectedFirst = $('.selected-first');
            $('.selected-last').removeClass('selected-last');
    
            const targetDate = dates.toString(target);
            const $target = $(`.calendar-wrap .day[data-date="${targetDate}"]`);
            $target.addClass('selected-last');
    
            this.selectedDays = [new Date($selectedFirst.attr('data-date')), new Date(targetDate)];

            const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date(target)].sort((a, b) => a > b ? 1 : -1);
            let days = [];

            if (ui.viewIs('full')) {
                const lowestWeekDay = Math.min(...this.selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
                const highestWeekDay = Math.max(...this.selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
        
                start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
                end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
                
                days = dates.range(start, end);
        
                // Filter out days out of rectangle
                days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);
            } else {
                days = dates.range(start, end);
            }
    
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
        this.scrollInView(e.which);
    },

    emptySelection() {
        // Create action for history
        const action = {
            type: 'removeEvents',
            events: []
        };

        const removeEvents = $events => {
            $events.each((_, el) => {
                const $el = $(el);

                const id = parseInt($el.attr('data-id'));
                const start = $(`.event[data-id="${id}"].start`).closest('.day').attr('data-date');
                const end = $(`.event[data-id="${id}"].end`).closest('.day').attr('data-date');

                if (!start || !end) return;
                
                const event = {
                    id,
                    calendar: parseInt($el.parents('.calendar').attr('data-id')),
                    type: parseInt($el.attr('data-type')),
                    start,
                    end
                };
                
                events.removeEvent(event);
                
                // Save events in action
                action.events.push(event);
            });
        }
        
        if (ui.toolIs('draw')) {
            const $events = $('.event.selected');
            removeEvents($events);    
        }
        else if (ui.tool === 'select') {
            for (const day of this.selectedDays) {
                const date = dates.toString(day);
                let $events;
                if (calendars.editAll) {
                    $events = $(`.calendars-wrap .day[data-date="${date}"] .event`);
                } else {
                    $events = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event`);
                }

                if (!$events.length) continue;
                removeEvents($events);
            }
        }
    
        // Save action in history
        history.pushAction(action);

        calendars.updateCalendarHeight();
        stats.update();
        data.save();
    },
    
    selectAll() {
        if (ui.toolIs('select')) {
            const start = new Date($('#start').val());
            const end = new Date($('#end').val());
    
            this.selectedDays = dates.range(start, end);
    
            this.highlightSelection();
        } else if (ui.toolIs('draw')) {
            $('.calendar.selected .event').addClass('selected');
        }
    },

    selectByWeekdays(days, add = false, remove = false) {
        const start = new Date($('#start').val());
        const end = new Date($('#end').val());

        if (!add) this.selectedDays = [];

        for (const day of days) {
            this.selectedDays.push(...dates.range(start, end).filter(d => d.getDay() === parseInt(day)));
            
            const $day = $(`.head.full [data-day=${day}]`);
            $day.addClass('selected');
            
            if (remove) {
                this.selectedDays = this.selectedDays.filter(d => d.getDay() !== parseInt(day));
                $day.removeClass('selected');
            }
        }

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

        newEvent.hide();
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
                $events.each((_, el) => {
                    const $el = $(el);
        
                    const event = {
                        type: parseInt($el.attr('data-type')),
                        calendar: parseInt($el.closest('.calendar').attr('data-id')),
                        id: parseInt($el.attr('data-id'))
                    };

                    if (events.flat().some(e => e?.id === event.id)) {
                        const _e = events.flat().find(e => e?.id === event.id);
                        _e.duration = _e.duration ? _e.duration + 1 : 2;
                    } else {
                        eventsThatDay.push(event);
                    }
                });
                events.push(eventsThatDay);
            } else {
                events.push(null);
            }
        }
    
        // Convert 1D array of events to 2D array to mimic selection bounding rectangle layout
        while (events.length) this.clipboard.push(events.splice(0, highestWeekDay - lowestWeekDay + 1));

        if (this.clipboard.length) $('nav [data-tool="paste"').removeClass('disabled');
        else $('nav [data-tool="paste"').addClass('disabled');
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
                    const start = dates.toString(target);
                    const end = dates.toString(dates.relativeDate(start, _event.duration - 1 || 0));

                    for (const calendarID of calendars.getSelectedCalendars()) {
                        // Create event
                        const event = {
                            ..._event,
                            id: ++events.eventID,
                            calendar: calendarID,
                            start,
                            end
                        };
                
                        // Build event
                        events.buildEvent(event);
            
                        // Save event in action
                        action.events.push(event);
                    }
                }
            }
        }

        // Save action in history
        history.pushAction(action);

        stats.update();
    },

    highlightSelection() {
        // Reset all currently selected days
        $('.day.selected').removeClass('selected no-top no-right no-bottom no-left');

        $('.event.selected').removeClass('selected');
        const selectedEvents = new Set();

        for (const day of this.selectedDays) {
            const date = dates.toString(day);
            const $el = $(`main:not(.linear) .calendar .day[data-date="${date}"], main.linear .calendar.selected .day[data-date="${date}"]`);

            // Select day
            $el.addClass('selected');
            
            // Add styles classes (for borders)
            const dayBeforeSelected = dates.isInArray(this.selectedDays, dates.relativeDate(day, -1));
            const dayAfterSelected = dates.isInArray(this.selectedDays, dates.relativeDate(day, 1));

            if (ui.viewIs('full')) {
                const dayWeekBeforeSelected = dates.isInArray(this.selectedDays, dates.relativeDate(day, -7));
                const dayWeekAfterSelected = dates.isInArray(this.selectedDays, dates.relativeDate(day, 7));
                
                if (dayBeforeSelected && day.getDay() !== 1) $el.addClass('no-left');
                if (dayAfterSelected && day.getDay() !== 0) $el.addClass('no-right');
                if (dayWeekBeforeSelected) $el.addClass('no-top');
                if (dayWeekAfterSelected) $el.addClass('no-bottom');
            }
            else if (ui.viewIs('linear')) {
                if (dayBeforeSelected) $el.addClass('no-left');
                if (dayAfterSelected) $el.addClass('no-right');
            }

            const $events = $(`.calendar-wrap .day[data-date="${date}"] .event`);
            $events.each((_, el) => {
                const id = parseInt($(el).attr('data-id'));
                if (!isNaN(id)) selectedEvents.add(id);
            });
        }

        // for (const eventID of [...selectedEvents]) {
        //     this.selectEventByID(eventID);
        // }

        if (this.selectedDays.length || $('.event.selected').length) {
            $('nav [data-tool="cut"]').removeClass('disabled');
            $('nav [data-tool="copy"]').removeClass('disabled');
        } else {
            $('nav [data-tool="cut"]').addClass('disabled');
            $('nav [data-tool="copy"]').addClass('disabled');
        }
    },

    scrollInView(key) {
        const dir = {
            '37': 'left',
            '38': 'up',
            '39': 'right',
            '40': 'down'
        }[key];

        const duration = 150;

        const height = calendars.getCalendarHeight();
        const marginV = height * 1.5;

        const highest = Math.min(...$('.calendar-wrap .day.selected').toArray().map(d => $(d).offset().top));
        const lowest = Math.max(...$('.calendar-wrap .day.selected').toArray().map(d => $(d).offset().top)) + height;

        const top = $('.calendar-wrap .calendars').offset().top;

        if (ui.viewIs('full')) {
            const bottom = top + $('.calendar-wrap .calendar.selected').outerHeight();

            if (dir === 'up' && highest - top < marginV) {
                const scrollTop = $('.calendar-wrap .calendar.selected').scrollTop() - (top - highest) - marginV;
                $('.calendar-wrap .calendar.selected').stop().animate({ scrollTop }, duration);
            }
            
            if (dir === 'down' && lowest + marginV > bottom) {
                const scrollTop = $('.calendar-wrap .calendar.selected').scrollTop() - (bottom - lowest) + marginV;
                $('.calendar-wrap .calendar.selected').stop().animate({ scrollTop }, duration);
            }
        } else if (ui.viewIs('linear')) {
            const bottom = top + $('.calendar-wrap .calendars').outerHeight();

            const backToTop = !$('.calendars-wrap .calendar.selected').prevAll('.calendar:not(.hidden)').length;
            const backToBottom = !$('.calendars-wrap .calendar.selected').nextAll('.calendar:not(.hidden)').length;

            const width = $('.calendar-wrap .day').outerWidth();
            const marginH = width * 1.5;

            const leftest = Math.min(...$('.calendar-wrap .day.selected').toArray().map(d => $(d).offset().left));
            const rightest = Math.max(...$('.calendar-wrap .day.selected').toArray().map(d => $(d).offset().left)) + width;

            const left = $('.calendar-wrap .calendars').offset().left;
            const right = left + $('.calendar-wrap').outerWidth();

            let loop = false;
            let timeout;
            const moveStickyLabels = start => {
                if (start === true) {
                    loop = true;
                    timeout = setTimeout(() => { loop = false }, duration);
                }
                ui.moveStickyLabels();
                if (loop) requestAnimationFrame(moveStickyLabels);
            }

            if ((dir === 'up' || backToTop) && highest - marginV < top) {
                const scrollTop = $('.calendar-wrap .calendars').scrollTop() - (top - highest) - marginV;
                $('.calendar-wrap .calendars, .calendars-wrap .scroll-wrap').stop().animate({ scrollTop }, duration);
            }

            if ((dir === 'down' || backToBottom) && lowest + marginV > bottom) {
                const scrollTop = $('.calendar-wrap .calendars').scrollTop() - (bottom - lowest) + marginV;
                $('.calendar-wrap .calendars, .calendars-wrap .scroll-wrap').stop().animate({ scrollTop }, duration);
            }

            if (dir === 'left' && leftest - marginH - $('.calendar-wrap').scrollLeft() < left) {
                const scrollLeft = leftest - left - marginH;
                moveStickyLabels(true);
                $('.calendar-wrap').stop().animate({ scrollLeft }, duration);
            }

            if (dir === 'right' && rightest + marginH - $('.calendar-wrap').scrollLeft() > right) {
                const scrollLeft = rightest - right + marginH;
                moveStickyLabels(true);
                $('.calendar-wrap').stop().animate({ scrollLeft }, duration);
            }
        }
    },

    replaceEvents(from, to) {
        // Create action for history
        const action = {
            type: 'replaceEvents',
            events: []
        };

        const options = {
            calendars: calendars.getSelectedCalendars(),
            days: this.selectedDays,
            type: from
        };
        const eventsToReplace = events.findEvents(options);

        for (const event of eventsToReplace) {
            event.from = event.type;
            event.type = to;

            // Replace event
            events.replaceEvent(event);

            // Save event in action
            action.events.push(event);
        }

        // Save action in history
        history.pushAction(action);

        data.save();
    },

    removeEvents(type) {
        // Create action for history
        const action = {
            type: 'removeEvents',
            events: []
        };

        for (const day of this.selectedDays) {
            const date = dates.toString(day);
            const $events = calendars.editAll ? $(`.day[data-date="${date}"] .event[data-type="${type}"]`) : $(`.calendar.selected .day[data-date="${date}"] .event[data-type="${type}"]`);

            $events.each((_, el) => {
                const $el = $(el);

                const event = {
                    id: parseInt($el.attr('data-id')),
                    calendar: parseInt($el.closest('.calendar').attr('data-id')),
                    type: parseInt($el.attr('data-type')),
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

        data.save();
    },

    allDaysEmpty() {
        if (calendars.editAll) {
            return !this.selectedDays.some(day => $(`.day[data-date="${dates.toString(day)}"] .event`).length);
        } else {
            return !this.selectedDays.some(day => $(`.calendar.selected .day[data-date="${dates.toString(day)}"] .event`).length);
        }
    },

    selectEventByID(id, toggle = false) {
        const $event = $(`.calendar-wrap .event[data-id="${id}"]`);
        if (toggle) $event.toggleClass('selected');
        else $event.addClass('selected');
    },

    dragEvent(e) {
        const $day = $(e.currentTarget);
        const date = $day.attr('data-date');

        const delta = dates.delta(this.event.dragging, date);

        this.event.start = dates.relativeDate(new Date(this.event.start), delta);
        this.event.end = dates.relativeDate(new Date(this.event.end), delta);
        this.event.dragging = dates.relativeDate(new Date(this.event.dragging), delta);

        events.updateEvent(this.event, false);

        this.maxHeight = Math.max(this.maxHeight, calendars.getCalendarHeight());
        calendars.updateCalendarHeight(this.maxHeight);

        this.selectEventByID(this.event.id);
    },

    endDrag() {
        this.event = null;

        this.dragging = false;

        calendars.updateCalendarHeight();

        data.save();
    },

    resizeEvent(e) {
        const $day = $(e.currentTarget);
        const date = $day.attr('data-date');

        if (this.event.anchor === 'start' && date <= this.event.end) this.event.start = date;
        else if (this.event.anchor === 'end' && date >= this.event.start) this.event.end = date;

        events.updateEvent(this.event, false);

        this.maxHeight = Math.max(this.maxHeight, calendars.getCalendarHeight());
        calendars.updateCalendarHeight(this.maxHeight);
    },

    endResize() {
        this.event = null;
        
        this.resizing = false;
        $('.calendar.resizing').removeClass('resizing');

        this.maxHeight = calendars.getCalendarHeight();
        calendars.updateCalendarHeight();

        data.save();
    }
}