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

// Add new calendar
$(document).on('click', '.calendars-wrap .add', () => {
    const calendar = `<div class="calendar sortable">
        <div class="tools">
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
        const $calendarToSelect = $calendar.next().length ? $calendar.next() : $calendar.prev().length ? $calendar.prev() : null;
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

    // Update title
    $('.calendar-wrap h2').html($calendar.find('p span').html());

    // Update main calendar
    $('.calendar-wrap .content').html($calendar.find('.content').html());

    // Unselect any selection
    window.getSelection().removeAllRanges();
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

let event = { id: 1 };
let selectedDays = []; 

$(document).on('mousedown', '.calendar-wrap .day', e => {
    const $day = $(e.target).closest('.day');
    const date = $day.attr('data-date')

    if (e.metaKey) {
        if (selectedDays.some(d => d.getTime() === new Date(date).getTime())) selectedDays = selectedDays.filter(d => d.getTime() !== new Date(date).getTime());
        else selectedDays.push(new Date(date)); 
    } else if (e.shiftKey) {
        const $firstSelectedDay = $('.calendar-wrap .day.selectedFirst').length ? $('.calendar-wrap .day.selectedFirst') : $('.calendar-wrap .day.selected').eq(0);
        $firstSelectedDay.addClass('selectedFirst');

        selectedDays = [new Date($firstSelectedDay.attr('data-date')), new Date(date)];

        const lowestWeekDay = Math.min(...selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
        const highestWeekDay = Math.max(...selectedDays.map(d => d.getDay()).map(w => w === 0 ? 7 : w));

        let start = new Date($firstSelectedDay.attr('data-date'));    
        let end = new Date($day.attr('data-date'));
        
        if (start > end) {
            const _start = start;
            start = end;
            end = _start;
        }
        
        start.setDate(start.getDate() - (start.getDay() - lowestWeekDay));
        end.setDate(end.getDate() + (highestWeekDay - end.getDay()));
        
        let days = [start];

        // Build array of all days from firstDay to end
        while (days[days.length - 1] < end && days.length < 100) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

        // Filter out days out of rectangle
        days = days.filter(d => d.getDay() >= lowestWeekDay && d.getDay() <= highestWeekDay);

        selectedDays = days;
    } else if (e.altKey) {
        const $firstSelectedDay = $('.calendar-wrap .day.selectedFirst').length ? $('.calendar-wrap .day.selectedFirst') : $('.calendar-wrap .day.selected').eq(0);
        $firstSelectedDay.addClass('selectedFirst');

        let start = new Date($firstSelectedDay.attr('data-date'));
        let end = new Date($day.attr('data-date'));

        if (start > end) {
            const _start = start;
            start = end;
            end = _start;
        }

        const days = [start];
    
        // Build array of all days from firstDay to end
        while (days[days.length - 1] < end) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

        selectedDays = days;
    } else {
        if (selectedDays.length && selectedDays[0].getTime() === new Date(date).getTime()) {
            selectedDays = []; 
        } else {
            selectedDays = [new Date(date)]; 
            $('.calendar-wrap .day.selectedFirst').removeClass('selectedFirst');
            $day.addClass('selectedFirst');
        }
    }
    highlightSelection();

    // const $event = $('.events-wrap ul li.selected');
    // const type = $event.attr('data-type');

    // // Already an event that day, when unallowed
    // if (!settings.multipleEventsPerDay && $(e.target).closest('.day').find('.event').length) {
    //     const $presentEvent = $day.find('.event');

    //     // Remove event in main calendar and sidebar
    //     const $events = $(`.calendars-wrap .calendar.selected [data-date="${$presentEvent.closest('.day').attr('data-date')}"] .event, .calendar-wrap [data-date="${$presentEvent.closest('.day').attr('data-date')}"] .event`);
    //     $events.remove();

    //     // If same type, simply remove event and don't recreate one (toggle-like behavior)
    //     if (type === $presentEvent.attr('data-type')) return;
    // }

    // event.type = type;
    // event.title = $event.text();
    // event.color = $event.css('background-color');
    // event.start = $day.attr('data-date');
    // event.end = $day.attr('data-date');

    // buildEvent();
});

function highlightSelection() {
    $('.calendar-wrap .day.selected').removeClass('selected');

    for (const day of selectedDays) {
        const date = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
        const $el = $(`.calendar-wrap .day[data-date="${date}"]`);
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

$(document).on('mouseenter', '.day', e => {
    if (!event.title || !settings.spreadOnDrag) return;
    event.end = $(e.target).closest('.day').attr('data-date');

    buildEvent();
});

$(document).on('mouseup', '.day', e => {
    event = { id: event.id + 1 };
});

function buildEvent() {
    $(`.event[data-id="${event.id}"]`).remove();

    let start = new Date(event.start);
    let end = new Date(event.end);

    if (start > end) {
        const _start = start;
        start = end;
        end = _start;
    }

    const days = [start];
    
    // Build array of all days from firstDay to end
    while (days[days.length - 1] < end) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));

    for (day of days) {
        const date = `${day.getFullYear()}-${`${day.getMonth() + 1}`.padStart(2, '0')}-${`${day.getDate()}`.padStart(2, '0')}`;
        const $el = $(`.calendars-wrap .calendar.selected .day[data-date="${date}"], .calendar-wrap .day[data-date="${date}"]`);

        // Add event
        let classname = days.indexOf(day) === 0 ? ' start' : '';
        classname += days.indexOf(day) === days.length - 1 ? ' end' : '';
        $el.append(`<div data-id="${event.id}" data-type="${event.type}" class="event${classname}" style="background-color: ${event.color}">${classname.includes('start') ? `<span>${event.title}</span>` : ''}</div>`);
    }
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

$(document).on('mousedown', '.sortable', e => {
    $sortedEl = $(e.target).closest('.sortable');

    sortedPosition = $sortedEl.position();
    
    sortedOrigin = {
        x: e.clientX,
        y: e.clientY
    };

    $sortedEl.css({
        'cursor': 'grabbing',
        'zIndex': 1
    });

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
});

$(document).on('mouseup', e => {
    if (!$sortedEl) return;

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
});

$(document).on('mousemove', e => {
    if (!$sortedEl) return;

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
});

function addEvents(array) {
    for (const event of array) {
        const $ul = $('.events-wrap ul');
        const type = $ul.find('li').length;
        const li = `<li data-type="${type}" style="background-color: ${settings.eventsColors[type]}" class="sortable${type === 0 ? ' selected' : ''}"><span contenteditable>${event}</span></li>`;
        $ul.append(li);
    }
}