import calendars from './calendars';
import dates from './dates';

export default {
    init() {
        $(document).on('click', 'header nav>ul>li', e => {
            const $el = $(e.currentTarget);
            $el.siblings('.open').removeClass('open');
            $el.toggleClass('open');

            return false;
        });

        $(document).on('mouseenter', 'header nav>ul>li', e => {
            const $el = $(e.currentTarget);
            if ($el.siblings('.open').length) {
                $('header ul li.open').removeClass('open');
                $el.toggleClass('open');
            }

            return false;
        });

        $(document).on('click', 'header nav>ul>li li:not(.disabled)', e => {
            const $target = $(e.currentTarget);
            if ($target.attr('data-checkable') === '') {
                if ($target.attr('data-radio')) this.onRadioChange($target);
                else $target.toggleClass('checked');
            }

            return false;
        });

        $(document).on('click', '', e => {
            $('header ul li.open').removeClass('open');
        });
    },

    onRadioChange($target) {
        const radio = $target.attr('data-radio');
        $(`nav [data-radio="${radio}"]`).removeClass('checked');
        $target.addClass('checked');

        if (radio === 'view') {
            const view = $target.attr('data-value');
            if (view === 'full') this.fullView()
            else if (view === 'linear') this.linearView();
        }
    },

    fullView() {
        $('.calendars-wrap').find('.calendars .content, .add').show();
        $('main').removeClass('linear');

        $('.calendar-wrap .head').html(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => `<div>${d}</div>`).join(''));

        $('.calendar-wrap .calendar').eq(1).empty();
        $('.calendar-wrap .calendar').slice(1).remove();
        const $selectedCalendar = $('.calendars-wrap .calendar.selected');
        calendars.selectCalendar($selectedCalendar);

        calendars.updateCalendarHeight();
    },

    linearView() {
        $('.calendars-wrap').find('.calendars .content, .add').hide();
        $('main').addClass('linear');

        // Create range from first day to end
        const days = dates.range(calendars.start, calendars.end);

        // Update timeline
        $('.calendar-wrap .head').html(days.map(day => `<div>${day.toLocaleDateString('en-US', { weekday: 'short' })} ${day.getDate()} ${day.toLocaleDateString('en-US', { month: 'short' })}</div>`));

        $('.calendar-wrap .calendar').remove();

        // Duplicate every minical
        $('.calendars-wrap .calendar').each((id, el) => {
            const $el = $(el);
            const content = $el.find('.content').html();
            $('.calendar-wrap').append(`<div class="content calendar" data-id="${$el.attr('data-id')}">${content}</div>`);
        });

        calendars.updateCalendarHeight();
    }
}