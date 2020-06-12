$(document).ready(() => {
    buildCalendar();
});

$(document).on('change', '#start, #end', () => {
    buildCalendar();
});

let event = { id: 1 };

$(document).on('mousedown', '.day', e => {
    event.start = $(e.target).closest('.day').attr('data-iso');
    event.end = $(e.target).closest('.day').attr('data-iso');

    buildEvent();

    // $el.append('<div class="event start end"></div>');
});

$(document).on('mouseenter', '.day', e => {
    if (!event.start) return;
    event.end = $(e.target).closest('.day').attr('data-iso');

    buildEvent();

    // $el.append('<div class="event start end"></div>');
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
        const $el = $(`.day[data-iso="${iso}"]`);

        // Add event
        let classname = days.indexOf(day) === 0 ? ' start' : '';
        classname += days.indexOf(day) === days.length - 1 ? ' end' : '';
        $el.append(`<div data-id="${event.id}" class="event${classname}">${classname.includes('start') ? `Event ${event.id}` : ''}</div>`);
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

        html += `<div class="day${classname}" data-iso="${day.toISOString().split('T')[0]}">${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>`;

        if (day.getDay() === 0) html += '</div><div>';
    }
    html += '</div>';

    $('.calendar-wrap .content').html(html);
}