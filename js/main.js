$(document).ready(() => {
    buildCalendar();
});

function buildCalendar() {
    const today = new Date();
    // const today = new Date('2020-04-01');
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // console.log(firstDayOfMonth);
    // console.log(firstDayOfMonth.getDay());

    let html = '<div>';

    for (let i = 1; i < firstDayOfMonth.getDay(); i += 1) {
        const day = new Date(year, month - 1, i - firstDayOfMonth.getDay());
        html += `<div class="previous-month-day">${day.getDate()}</div>`;
    }

    for (let i = firstDayOfMonth.getDate(); i <= lastDayOfMonth.getDate(); i += 1) {
        const day = new Date(year, month, i);
        html += `<div>${i}</div>`;

        if (day.getDay() === 0) html += '</div><div>';
    }

    for (let i = lastDayOfMonth.getDay(); i < 7; i += 1) {
        const day = new Date(year, month + 1, i - lastDayOfMonth.getDay() + 1);
        html += `<div class="next-month-day">${day.getDate()}</div>`;
    }

    html += '</div>';

    $('.month-wrap').html(html);
}