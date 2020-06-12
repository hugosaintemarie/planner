const settings = {
    spreadOnDrag: false,
    multipleEventsPerDay: false,
}

$(document).ready(() => {
    const calendar = buildCalendar();

    $('.calendar-wrap .content').html(calendar);
    $('.calendars-wrap .calendar .content').html(calendar);
});

// Add new calendar
$(document).on('click', '.calendars-wrap .add', e => {
    const calendar = `<div class="calendar">
        <div class="tools">
            <i data-tool="duplicate" class="far fa-clone"></i>
            <i data-tool="delete" class="far fa-trash-alt"></i>
        </div>
        <div class="content">${ buildCalendar() }</div>
        <p><span contenteditable spellcheck="false">Calendar ${$('.calendars-wrap .calendar').length + 1}</span></p>
    </div>`;

    $(e.target).closest('.add').before(calendar);

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

$(document).on('click', '.events-wrap .add', e => {
    const event = `<li data-type="${$('.events-wrap ul li').length + 1}"><span contenteditable spellcheck="false"></span></li>`;

    const $ul = $(e.target).closest('.events-wrap').find('ul');
    $ul.append(event);

    // Select new event and focus span
    $ul.find('li:last-child').trigger('click');
    $ul.find('li:last-child span').focus();
    document.execCommand('selectAll', false, null);
});

$(document).on('change', '#start, #end', () => {
    const calendar = buildCalendar();

    $('.calendar-wrap .content').html(calendar);
    $('.calendars-wrap .calendar .content').html(calendar);
});

$(document).on('click', '.events-wrap ul li', e => {
    $('.events-wrap ul li.selected').removeClass('selected');
    $(e.target).closest('li').addClass('selected');
});

// Switch calendar
$(document).on('click', '.calendars-wrap .calendar .content', e => {
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