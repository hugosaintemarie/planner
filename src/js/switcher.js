import categories from './categories';
import events from './events';
import selection from './selection';
import ui from './ui';

export default {
    init() {
        // Hover new event type option
        $(document).on('mouseenter', '.switcher ul li', e => {
            const $el = $(e.currentTarget);
            $('.switcher ul li.selected').removeClass('selected');
            $el.addClass('selected');
        });

        // Click on new event type option
        $(document).on('click', '.switcher ul li', e => {
            const id = parseInt($(e.currentTarget).attr('data-category'));
            selection.changeCategory(id);
        });

        $(document).on('mousedown', '.switcher ul li', () => {
            return false;
        });

        // Up/down arrow keys + enter key in new event type options
        $(document).on('keydown', e => {
            if (!selection.event) return;
            const $li = $('.switcher ul li.selected');

            if (e.which === 38) { // Up
                if ($li.length) {
                    if ($li.prev('li').length) $li.prev('li').addClass('selected');
                    else $('.switcher ul li:last-child').addClass('selected');
                    $li.removeClass('selected');
                } else {
                    $('.switcher ul li:last-child').addClass('selected');
                }
            } else if (e.which === 40) { // Down
                if ($li.length) {
                    if ($li.next('li').length) $li.next('li').addClass('selected');
                    else $('.switcher ul li:first-child').addClass('selected');
                    $li.removeClass('selected');
                } else {
                    $('.switcher ul li:first-child').addClass('selected');
                }
            } else if (e.which === 13) { // Enter
                if ($li.length && $('.switcher').hasClass('visible')) {
                    const id = parseInt($li.attr('data-category'));
                    selection.changeCategory(id);
                } else {
                    selection.changeCategory();
                }
            }
        });

        $(document).on('wheel', '.calendar-wrap .calendars .calendar', () => {
            if (ui.viewIs('full')) {
                const top = $('.calendar-wrap .calendars .calendar').scrollTop();
                $('.switcher').css('margin-top', -top);
            }
        });
    },

    buildCategoriesList(categories) {
        return `<ul>${Object.values(categories).map(e => `<li data-category="${e.id}"><span class="event-icon" data-color="${e.color}"></span>${e.title}</li>`).join('')}</ul>`;
    },

    show($event) {
        const $wrap = $('.calendar-wrap .calendars');

        $('.switcher')
            .css({
                top: $event.offset().top - $wrap.offset().top + $event.outerHeight() + 8,
                left: $event.offset().left - $wrap.offset().left,
                marginTop: $wrap.scrollTop(),
                marginLeft: $wrap.scrollLeft()
            })
            .html(this.buildCategoriesList(categories.list))
            .addClass('visible');
    },

    update(categoriesList) {
        $('.switcher').html(this.buildCategoriesList(categoriesList)).addClass('visible');
    },

    hide() {
        $('.switcher').removeClass('visible');
    }
}