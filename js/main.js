const settings = {
    spreadOnDrag: false,
    multipleEventsPerDay: false,
    eventsColors: ['#1d6c99', '#c2761f', '#109210', '#8a2e82', '#c56a94']
}

$(document).ready(() => {
    const calendar = buildCalendar();

    $('.calendar-wrap .content').html(calendar);
    $('.calendars-wrap .calendar .content').html(calendar);

    addEvents(['Workout', 'Tennis', 'Jogging']);
});

let calendarID = 0;

// Add new calendar
$(document).on('click', '.calendars-wrap .add', () => {
    const calendar = `<div class="calendar sortable" data-id="${++calendarID}">
        <div class="tools">
            <i data-tool="toggle" class="far fa-eye"></i>
            <i data-tool="sort">⋮⋮</i>
            <i data-tool="duplicate" class="far fa-clone"></i>
            <i data-tool="delete" class="far fa-trash-alt"></i>
        </div>
        <div class="content">${ buildCalendar() }</div>
        <p><span contenteditable spellcheck="false">Calendar ${$('.calendars-wrap .calendar').length + 1}</span></p>
    </div>`;

    $('.calendars-wrap .calendars').append(calendar);
    const $calendar = $('.calendars-wrap .calendar:last-child');

    selectCalendar($calendar);
});

$(document).on('click', '.calendars-wrap [data-tool="toggle"]', e => {
    const $calendar = $(e.target).closest('.calendar')
    $calendar.toggleClass('hidden');
    if ($calendar.hasClass('selected')) {
        const $calendarToSelect = $calendar.nextAll(':not(.hidden)').eq(0).length ? $calendar.nextAll(':not(.hidden)').eq(0) : $calendar.prevAll(':not(.hidden)').length ? $calendar.prevAll(':not(.hidden)') : null;
        if ($calendarToSelect) selectCalendar($calendarToSelect);
    }
});

// Duplicate calendar
$(document).on('click', '.calendar .tools [data-tool="duplicate"]', e => {
    const $calendar = $(e.target).closest('.calendar')
    const $new = $calendar.clone();

    // Remove selected class and rename with 'copy'
    $new.removeClass('selected');
    $new.find('p span').append(' copy');

    // Clone calendar
    $calendar.after($new);

    // Unselect any selection
    window.getSelection().removeAllRanges();
});

// Delete calendar
$(document).on('click', '.calendar .tools [data-tool="delete"]', e => {
    const $calendar = $(e.target).closest('.calendar');
    if ($calendar.hasClass('selected')) {
        const $calendarToSelect = $calendar.nextAll(':not(.hidden)').eq(0).length ? $calendar.nextAll(':not(.hidden)').eq(0) : $calendar.prevAll(':not(.hidden)').length ? $calendar.prevAll(':not(.hidden)') : null;
        if ($calendarToSelect) selectCalendar($calendarToSelect);
    }
    $calendar.remove();
});

// Add new event
$(document).on('click', '.events-wrap .add', e => {
    const type = parseInt($('.events-wrap ul li').length);
    const event = `<li data-type="${type}" class="sortable" style="background-color: ${settings.eventsColors[type]}"><span contenteditable spellcheck="false"></span></li>`;

    const $ul = $(e.target).closest('.events-wrap').find('ul');
    $ul.append(event);

    // Select new event and focus span
    $ul.find('li.selected').removeClass('selected');
    $ul.find('li:last-child').addClass('selected');
    $ul.find('li:last-child span').focus();
});

$(document).on('change', '#start, #end', () => {
    const calendar = buildCalendar();

    $('.calendar-wrap .content').html(calendar);
    $('.calendars-wrap .calendar .content').html(calendar);
});

$(document).on('mousedown', '.events-wrap ul li', e => {
    $('.events-wrap ul li.selected').removeClass('selected');
    $(e.target).closest('li').addClass('selected');
});

// Switch calendar
$(document).on('mousedown', '.calendars-wrap .calendar .content', e => {
    const $calendar = $(e.target).closest('.calendar');
    selectCalendar($calendar);
});

function selectCalendar($calendar) {
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

    highlightSelection();
}

// // Click on contenteditable: select all
// $(document).on('click', '[contenteditable]', e => {
//     document.execCommand('selectAll', false, null);
// });

// // Tab to contenteditable: select all
// $(document).on('keyup', '[contenteditable]', e => {
//     if (e.which === 9) document.execCommand('selectAll', false, null);
// });

// Enter key in contenteditable: prevent new line and blur
$(document).on('keypress', '[contenteditable]', e => {
    if (e.which === 13) {
        $(e.target).blur();
        return false;
    }
});

// Rename calendar in sidebar
$(document).on('input', '.calendars-wrap p span', e => {
    if ($(e.target).closest('.calendar').hasClass('selected')) {
        const val = $(e.target).text();
        $('.calendar-wrap h2').text(val);
    }
});

// Rename selected calendar
$(document).on('input', '.calendar-wrap h2', e => {
    const val = $(e.target).text();
    $('.calendars-wrap .calendar.selected p span').text(val);
});

// Rename event
$(document).on('input', '.events-wrap ul span', e => {
    const $el = $(e.target);
    const val = $el.text();
    const type = $el.closest('li').attr('data-type');

    $(`.event[data-type="${type}"] span`).text(val);
});

let eventID = 0;
let selectedDays = []; 

$(document).on('mousedown', '.calendar-wrap .day', e => {
    const $day = $(e.target).closest('.day');
    const date = $day.attr('data-date');

    if (e.metaKey && !e.shiftKey && !e.altKey) {
        $('.selected-first').removeClass('selected-first');
        $day.addClass('selected-first');

        if (selectedDays.some(d => d.getTime() === new Date(date).getTime())) {
            selectedDays = selectedDays.filter(d => d.getTime() !== new Date(date).getTime());
        } else {
            selectedDays.push(new Date(date)); 
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
        
        let days = [start];

        // Build array of all days from firstDay to end
        while (days[days.length - 1] < end && days.length < 100) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

        // Filter out days out of rectangle
        days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);

        if (e.metaKey) selectedDays.push(...days);
        else selectedDays = days;
    } else if (e.altKey) {
        const $selectedFirst = $('.calendar-wrap .day.selected-first').length ? $('.calendar-wrap .day.selected-first') : $('.calendar-wrap .day.selected').eq(0);
        $selectedFirst.addClass('selected-first');

        const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date($day.attr('data-date'))].sort((a, b) => a > b ? 1 : -1);

        const days = [start];
    
        // Build array of all days from firstDay to end
        while (days[days.length - 1] < end) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

        if (e.metaKey) selectedDays.push(...days);
        else selectedDays = days;
    } else {
        if (selectedDays.length && selectedDays[0].getTime() === new Date(date).getTime()) {
            selectedDays = []; 
        } else {
            selectedDays = [new Date(date)]; 
            $('.calendar-wrap .day.selected-first').removeClass('selected-first');
            $('.calendar-wrap .day.selected-last').removeClass('selected-last');
            $day.addClass('selected-first selected-last');
        }
    }
    highlightSelection();
});

$(document).on('keydown', e => {
    const ctrlOrMeta = e.metaKey || e.ctrlKey;

    if ([37, 38, 39, 40].includes(e.which)) moveSelection(e); // Arrow keys: move selection
    else if (e.which === 8) emptySelection(); // Backspace
    else if (ctrlOrMeta && e.which === 67) copySelection(); // C
    else if (ctrlOrMeta && e.which === 88) cutSelection(); // X
    else if (ctrlOrMeta && e.which === 86) pasteSelection(); // V
    else if (ctrlOrMeta && e.which === 90) { // Z
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
    }
});

function moveSelection(e) {
    // Ignore if no selection
    const $selected = $('.calendar-wrap .day.selected-last');
    if (!$selected.length) return;

    let target;
    const date = new Date($selected.attr('data-date'));

    if (e.which === 37) {
        if (e.metaKey && e.shiftKey) {
            // Meta + shift + left: beggining of week
            target = new Date(date.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() + 1)));
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
        if (e.metaKey && e.shiftKey) {
            // Meta + shift + right: end of week
            target = new Date(date.setDate(date.getDate() + 7 - date.getDay()));
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

        const targetDate = `${target.getFullYear()}-${`${target.getMonth() + 1}`.padStart(2, '0')}-${`${target.getDate()}`.padStart(2, '0')}`;
        const $target = $(`.calendar-wrap .day[data-date="${targetDate}"]`);
        $target.addClass('selected-last');

        selectedDays = [new Date($selectedFirst.attr('data-date')), new Date(date)];

        const lowestWeekDay = Math.min(...selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
        const highestWeekDay = Math.max(...selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));

        const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date(target)].sort((a, b) => a > b ? 1 : -1);

        start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
        end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
        
        let days = [start];

        // Build array of all days from firstDay to end
        while (days[days.length - 1] < end && days.length < 100) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

        // Filter out days out of rectangle
        days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);

        selectedDays = days;
    } else if (e.altKey) {
        const $selectedFirst = $('.selected-first');
        $('.selected-last').removeClass('selected-last');

        const targetDate = `${target.getFullYear()}-${`${target.getMonth() + 1}`.padStart(2, '0')}-${`${target.getDate()}`.padStart(2, '0')}`;
        const $target = $(`.calendar-wrap .day[data-date="${targetDate}"]`);
        $target.addClass('selected-last');

        const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date(target)].sort((a, b) => a > b ? 1 : -1);

        const days = [start];
    
        // Build array of all days from firstDay to end
        while (days[days.length - 1] < end) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

        selectedDays = days;
    } else {
        const date = `${target.getFullYear()}-${`${target.getMonth() + 1}`.padStart(2, '0')}-${`${target.getDate()}`.padStart(2, '0')}`;
        const $target = $(`.calendar-wrap .day[data-date="${date}"]`);
        $('.selected-first').removeClass('selected-first');
        $('.selected-last').removeClass('selected-last');
        $target.addClass('selected-first selected-last');
        
        selectedDays = [target];
    }

    highlightSelection();
}

function highlightSelection() {
    $('.day.selected').removeClass('selected');

    for (const day of selectedDays) {
        const date = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
        const $el = $(`.day[data-date="${date}"]`);
        $el.addClass('selected');
        $el.removeClass('no-top no-right no-bottom no-left');
        
        const dayBeforeSelected = selectedDays.some(d => d.getTime() === new Date(new Date(day).setDate(day.getDate() - 1)).getTime());
        const dayAfterSelected = selectedDays.some(d => d.getTime() === new Date(new Date(day).setDate(day.getDate() + 1)).getTime());
        const dayWeekBeforeSelected = selectedDays.some(d => d.getTime() === new Date(new Date(day).setDate(day.getDate() - 7)).getTime());
        const dayWeekAfterSelected = selectedDays.some(d => d.getTime() === new Date(new Date(day).setDate(day.getDate() + 7)).getTime());

        if (dayWeekBeforeSelected) $el.addClass('no-top');
        if (dayAfterSelected && day.getDay() !== 0) $el.addClass('no-right');
        if (dayWeekAfterSelected) $el.addClass('no-bottom');
        if (dayBeforeSelected && day.getDay() !== 1) $el.addClass('no-left');
    }
}

function emptySelection() {
    const action = {
        type: 'removeEvents',
        events: []
    };

    for (day of selectedDays) {
        const date = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
        
        const $event = $(`.calendar-wrap .day[data-date="${date}"] .event`);
        $event.remove();

        const event = {
            id: eventID++,
            calendar: parseInt($('.calendars-wrap .calendar.selected').attr('data-id')),
            type: $event.attr('data-type'),
            title: $event.find('.title').text(),
            color: $event.css('background-color'),
            start: date,
            end: date
        };

        action.events.push(event);

        $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event`).remove();
    }

    pushAction(action);
}

let clipboard = [];

function copySelection() {
    clipboard = [];

    const firstDayInSelection = new Date(Math.min(...selectedDays));
    const lastDayInSelection = new Date(Math.max(...selectedDays));
    const lowestWeekDay = Math.min(...selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
    const highestWeekDay = Math.max(...selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));

    const [start, end] = [firstDayInSelection, lastDayInSelection];

    start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
    end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));

    let days = [start];

    // Build array of all days from firstDay to end
    while (days[days.length - 1] < end && days.length < 100) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

    // Filter out days out of rectangle
    days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);

    const events = [];
    for (const day of days) {
        // Ignore unselected days
        if (!selectedDays.some(d => d.getTime() === day.getTime())) {
            events.push(null);
            continue;
        };

        const date = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
        const $events = $(`.calendar-wrap .day[data-date="${date}"] .event`);

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

    while (events.length) clipboard.push(events.splice(0, highestWeekDay - lowestWeekDay + 1));
}

function cutSelection() {
    copySelection();
    emptySelection();
}

function pasteSelection() {
    const $selected = $('.calendar-wrap .day.selected-first');
    const date = new Date($selected.attr('data-date'));

    for (let j = 0; j < clipboard.length; j += 1) {
        for (let i = 0; i < clipboard[0].length; i += 1) {
            const _event = clipboard[j][i];
            if (!_event) continue;

            const target = new Date(new Date(date).setDate(date.getDate() + j * 7 + i));
            const _date = `${target.getFullYear()}-${`${target.getMonth() + 1}`.padStart(2, '0')}-${`${target.getDate()}`.padStart(2, '0')}`;

            const event = { ..._event };
            event.start = _date;
            event.end = _date;
    
            buildEvent(event);
        }
    }
}

$(document).on('mouseenter', '.calendar-wrap .day', e => {
    if (selectedDays.length) dragSelect(e);
    // if (!event.title || !settings.spreadOnDrag) return;
    // event.end = $(e.target).closest('.day').attr('data-date');

    // buildEvent();
});

$(document).on('mouseup', '.day', e => {
    // event = { id: event.id + 1 };
});

$(document).on('click', '.events-wrap ul li', e => {
    const $event = $(e.target).closest('li');
    const type = $event.attr('data-type');

    const selectedDaysEvents = selectedDays.map(d => {
        const date = `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
        return $(`.calendar-wrap .day[data-date="${date}"] .event`).attr('data-type');
    });

    if (selectedDaysEvents.every(e => e === type)) {
        // If same type, simply remove event and don't recreate one (toggle-like behavior)
        for (day of selectedDays) {
            const date = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
            
            const $events = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event, .calendar-wrap .day[data-date="${date}"] .event`);
            $events.remove();

            // const action = {
            //     type: 'remove',

            // }
        }
    } else {
        const action = {
            type: 'addEvents',
            events: []
        };

        for (day of selectedDays) {
            const date = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
            
            const $events = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"] .event, .calendar-wrap .day[data-date="${date}"] .event`);
            $events.remove();
                
            const $day = $(`.calendar-wrap .day[data-date="${date}"]`);
            
            const event = {
                id: eventID++,
                calendar: parseInt($('.calendars-wrap .calendar.selected').attr('data-id')),
                type: type,
                title: $event.find('.title').text(),
                color: $event.css('background-color'),
                start: $day.attr('data-date'),
                end: $day.attr('data-date')
            };

            action.events.push(event);
    
            buildEvent(event);
        }

        pushAction(action);
    }
});
function buildEvent(event) {
    const [start, end] = [new Date(event.start), new Date(event.end)].sort((a, b) => a > b ? 1 : -1);

    const date = `${start.getFullYear()}-${`${start.getMonth() + 1}`.padStart(2, '0')}-${`${start.getDate()}`.padStart(2, '0')}`;

    const days = [start, end];

    const $el = $(`.calendar[data-id="${event.calendar}"] .day[data-date="${date}"]`);

    // Add event
    let classname = ' start end';
    $el.append(`<div data-id="${event.id}" data-type="${event.type}" class="event${classname}" style="background-color: ${event.color}">${classname.includes('start') ? `<span class="title">${event.title}</span>` : ''}</div>`);
}

function buildCalendar() {
    const start = new Date(new Date($('#start').val()).setHours(0));
    const end = new Date(new Date($('#end').val()).setHours(0));

    if (end < start) return;

    // Find first day (first Monday)
    const firstDay = new Date(new Date(start).setDate(start.getDate() - start.getDay() + (start.getDay() === 0 ? -6 : 1)));

    const days = [firstDay];
    
    // Build array of all days from firstDay to end
    while (days[days.length - 1] < end) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

    // Fill last week
    while (days.length % 7 !== 0) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

    // Build HTML
    let html = '<div>';
    for (day of days) {
        const date = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
        day.setHours(0);
        const classname = day < start || day > end ? ' out' : '';

        html += `<div class="day${classname}" data-date="${date}"><span>${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short' })}</span></div>`;

        if (day.getDay() === 0) html += '</div><div>';
    }
    html += '</div>';

    return html;
}

let $sortedEl;
let sortedPosition = {};
let sortedOrigin = {};

$(document).on('mousedown', '.sortable i[data-tool="sort"]', e => {
    startSort(e);
});

$(document).on('mouseup', e => {
    if ($sortedEl) stopSort(e);
});

$(document).on('mousemove', e => {
    if ($sortedEl) sort(e);
});

function startSort(e) {
    const $icon = $(e.target);
    $sortedEl = $icon.closest('.sortable');
    
    // Ignore sort if only child
    if ($sortedEl.is(':only-child')) return;

    sortedPosition = $sortedEl.position();
    
    sortedOrigin = {
        x: e.clientX,
        y: e.clientY
    };

    $icon.css('cursor', 'grabbing');

    $sortedEl.css('zIndex', '1');

    const $parent = $sortedEl.parent();

    $sortedEl.parent().css({
        'width': $parent.outerWidth(),
        'height': $parent.outerHeight()
    });

    $parent.children().each((id, el) => {
        const $el = $(el);
        $el.css({
            'top': $el.position().top,
            'left': $el.position().left,
            'width': $el.outerWidth(),
            'height': $el.outerHeight()
        });
    });

    $parent.children().each((id, el) => {
        $(el).css('position', 'absolute');
    });
}

function sort(e) {
    const deltaX = e.clientX - sortedOrigin.x;
    const deltaY = e.clientY - sortedOrigin.y;

    $sortedEl.css({
        'top': Math.min(Math.max(sortedPosition.top + deltaY, $sortedEl.parent().offset().top), $sortedEl.parent().offset().top + $sortedEl.parent().outerHeight() - $sortedEl.outerHeight()),
        // 'left': sortedPosition.left + deltaX
    });

    $sortedEl.nextAll().each((id, el) => {
        const $el = $(el);
        if ($sortedEl.position().top > $el.position().top - 30) {
            $el.css('top', $el.position().top - $sortedEl.outerHeight(true));
            $sortedEl.before($el);
        }
    });

    $sortedEl.prevAll().each((id, el) => {
        const $el = $(el);
        if ($sortedEl.position().top < $el.position().top + 30) {
            $sortedEl.after($el);
            $el.css('top', $el.position().top + $sortedEl.outerHeight(true));
        }
    });
}

function stopSort(e) {
    $sortedEl.css({
        'cursor': '',
        'zIndex': ''
    });
    
    const $parent = $sortedEl.parent();

    $sortedEl.parent().css({
        'width': '',
        'height': ''
    });

    $parent.children().each((id, el) => {
        const $el = $(el);
        $el.css({
            'top': '',
            'left': '',
            'width': '',
            'height': ''
        });
    });

    $parent.children().each((id, el) => {
        $(el).css('position', '');
    });

    $sortedEl = null;
}

function dragSelect(e) {
    if (e.which !== 1) return;

    const $day = $(e.target).closest('.day');
    const date = $day.attr('data-date');

    const $selectedFirst = $('.calendar-wrap .day.selected-first').length ? $('.calendar-wrap .day.selected-first') : $('.calendar-wrap .day.selected').eq(0);
    $selectedFirst.addClass('selected-first');


    let days = [];

    if (e.metaKey) {
        selectedDays.push(new Date(date));
    } else {
        const _selectedDays = [new Date($selectedFirst.attr('data-date')), new Date(date)];

        const lowestWeekDay = Math.min(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
        const highestWeekDay = Math.max(..._selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
    
        const [start, end] = [new Date($selectedFirst.attr('data-date')), new Date($day.attr('data-date'))].sort((a, b) => a > b ? 1 : -1);
        
        start.setDate(start.getDate() - ((start.getDay() === 0 ? 7 : start.getDay()) - lowestWeekDay));
        end.setDate(end.getDate() + (highestWeekDay - (end.getDay() === 0 ? 7 : end.getDay())));
        
        days = [start];
    
        // Build array of all days from firstDay to end
        while (days[days.length - 1] < end && days.length < 100) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));
    
        // Filter out days out of rectangle
        if (!e.altKey) days = days.filter(d => (d.getDay() === 0 ? 7 : d.getDay()) >= lowestWeekDay && (d.getDay() === 0 ? 7 : d.getDay()) <= highestWeekDay);
    }   

    if (!$selectedFirst.hasClass('selected')) {
        const date = $day.attr('data-date');
        selectedDays = selectedDays.filter(d => d.getTime() !== new Date(date).getTime());
    } else {
        if (e.metaKey) selectedDays.push(...days);
        else selectedDays = days;
    }

    highlightSelection();
}

function addEvents(array) {
    for (const event of array) {
        const $ul = $('.events-wrap ul');
        const type = $ul.find('li').length;
        const li = `<li data-type="${type}" style="background-color: ${settings.eventsColors[type]}" class="sortable${type === 0 ? ' selected' : ''}">
            <span class="title" contenteditable>${event}</span>
            <span class="tools">
                <i class="fas fa-caret-down"></i>
                <i data-tool="sort">⋮⋮</i>
            </span>
        </li>`;
        $ul.append(li);
    }
}

const actions = [];
let actionsIndex = 0;

function pushAction(action) {
    actions.length = actionsIndex;
    actions.push(action);
    actionsIndex += 1;
}

function undo() {
    if (actionsIndex - 1 < 0) return;
    actionsIndex -= 1;
    const action = actions[actionsIndex];

    if (action.type === 'addEvents') for (const event of action.events) removeEvent(event);
    else if (action.type === 'removeEvents') for (const event of action.events) buildEvent(event);
}

function removeEvent(event) {
    $(`.event[data-id="${event.id}"]`).remove();
}

function redo() {
    if (actionsIndex + 1 > actions.length) return;
    const action = actions[actionsIndex];
    if (action.type === 'addEvents') for (const event of action.events) buildEvent(event);
    else if (action.type === 'removeEvents') for (const event of action.events) removeEvent(event);

    actionsIndex += 1;
}