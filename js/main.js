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

    // Unselect any selection
    window.getSelection().removeAllRanges();
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
    $(e.target).closest('.calendar').remove();
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
    $('.calendars-wrap .calendar.selected').removeClass('selected');
    $(e.target).closest('.calendar').addClass('selected');

    // Update title
    $('.calendar-wrap h2').html($(e.target).closest('.calendar').find('p span').html());

    // Update main calendar
    $('.calendar-wrap .content').html($(e.target).closest('.calendar').find('.content').html());

    // Unselect any selection
    window.getSelection().removeAllRanges();
});

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

$(document).on('mousedown', '.calendar-wrap .day', e => {
    if (!settings.multipleEventsPerDay && $(e.target).closest('.day').find('.event').length) return;

    const $event = $('.events-wrap ul li.selected');

    event.type = $event.attr('data-type');
    event.title = $event.text();
    event.color = $event.css('background-color');
    event.start = $(e.target).closest('.day').attr('data-iso');
    event.end = $(e.target).closest('.day').attr('data-iso');

    buildEvent();
});

$(document).on('mouseenter', '.day', e => {
    if (!event.title || !settings.spreadOnDrag) return;
    event.end = $(e.target).closest('.day').attr('data-iso');

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
        const iso = day.toISOString().split('T')[0];
        const $el = $(`.calendars-wrap .calendar.selected .day[data-iso="${iso}"], .calendar-wrap .day[data-iso="${iso}"]`);

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
        day.setHours(0);

        const classname = day < start || day > end ? ' out' : '';

        html += `<div class="day${classname}" data-iso="${day.toISOString().split('T')[0]}"><span>${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short' })}</span></div>`;

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