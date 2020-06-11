$(document).ready(() => {
    buildCalendar();
});

$(document).on('change', '#start, #end', () => {
    buildCalendar();
});

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
        
        const classname = day < start || day > end ? 'out' : '';

        html += `<div class="${classname}">${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>`;

        if (day.getDay() === 0) html += '</div><div>';
    }
    html += '</div>';

    $('.month-wrap').html(html);
}