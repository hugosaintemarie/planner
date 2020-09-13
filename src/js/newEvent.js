import events from './events';
import selection from './selection';
import ui from './ui';

export default {
    init() {
        // Hover new event type option
        $(document).on('mouseenter', '.new-event ul li', e => {
            const $el = $(e.currentTarget);
            $('.new-event ul li.selected').removeClass('selected');
            $el.addClass('selected');
        });
    
        // Click on new event type option
        $(document).on('click', '.new-event ul li', e => {
            const type = parseInt($(e.currentTarget).attr('data-type'));
            selection.changeType(type);
        });
    
        $(document).on('mousedown', '.new-event ul li', () => {
            return false;
        });
    
        // Up/down arrow keys + enter key in new event type options
        $(document).on('keydown', e => {
            if (!this.event) return;
            const $li = $('.new-event ul li.selected');
            
            if (e.which === 38) { // Up
                if ($li.length) {
                    if ($li.prev('li').length) $li.prev('li').addClass('selected');
                    else $('.new-event ul li:last-child').addClass('selected');
                    $li.removeClass('selected');
                } else {
                    $('.new-event ul li:last-child').addClass('selected');
                }
            } else if (e.which === 40) { // Down
                if ($li.length) {
                    if ($li.next('li').length) $li.next('li').addClass('selected');
                    else $('.new-event ul li:first-child').addClass('selected');
                    $li.removeClass('selected');
                } else {
                    $('.new-event ul li:first-child').addClass('selected');
                }
            } else if (e.which === 13) { // Enter
                if ($li.length && $('.new-event').hasClass('visible')) {
                    const type = parseInt($li.attr('data-type'));
                    selection.changeType(type);
                } else {
                    selection.changeType();
                }
            }
        });

        $(document).on('wheel', '.calendar-wrap .calendars .calendar', () => {
            if (ui.viewIs('full')) {
                const top = $('.calendar-wrap .calendars .calendar').scrollTop();
                $('.new-event').css('margin-top', -top);
            }
        });
    },

    buildEventsTypesOptions(events) {
        return `<ul>${events.map(e => `<li data-type="${e.type}"><span class="event-icon" data-color="${e.color}"></span>${e.title}</li>`).join('')}</ul>`;
    },

    show($event) {
        const $wrap = $('.calendar-wrap .calendars');

        console.log($wrap.scrollTop());

        $('.new-event').css({
            top: $event.offset().top - $wrap.offset().top + $event.outerHeight() + 8,
            left: $event.offset().left - $wrap.offset().left,
            marginTop: $wrap.scrollTop(),
            marginLeft: $wrap.scrollLeft()
        })
        .html(this.buildEventsTypesOptions(events.data))
        .addClass('visible');
    },

    update() {
        $('.new-event').html(this.buildEventsTypesOptions(eventsList)).addClass('visible');
    },

    hide() {
        $('.new-event').removeClass('visible');
    }
}