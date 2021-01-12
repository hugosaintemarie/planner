import calendars from './calendars';
import dates from './dates';
import categories from './categories';
import selection from './selection';

export default {
    isOpen: false,
    layouts: {
        default: `<ul>
            <li data-tool="add" class="selected"><i class="fas fa-plus"></i><span>Add event…</span></li>
            <li data-tool="replace"><i class="fas fa-exchange-alt"></i>Replace event…</li>
            <li data-tool="remove"><i class="far fa-trash-alt"></i>Remove event…</li>
            <li data-tool="fill" class="border-top" disabled><i class="far fa-calendar-plus"></i>Fill empty days…</li>
            <li data-tool="count" disabled><i class="fa fa-calculator"></i>Count occurences…</li>
        </ul>`,
        add: `<div>
            <div class="head">
                <i class="fas fa-plus"></i><span>Add event…</span>
            </div>
            <ul></ul>
        </div>`,
        replace: `<div class="row">
            <div>
                <div class="head">
                    <i class="fas fa-exchange-alt"></i>Replace…
                </div>
                <ul class="from"></ul>
            </div>
            <div>
                <div class="head">With…</div>
                <ul class="to"></ul>
            </div>
        </div>`,
        remove: `<div>
            <div class="head">
                <i class="far fa-trash-alt"></i>Remove event…
            </div>
            <ul></ul>
        </div>`,
        count: `<div>
            <div class="head">
                <i class="fa fa-calculator"></i>Count occurences of…
            </div>
            <ul></ul>
        </div>`
    },

    init() {
        $(document).on('keypress', e => {
            if (e.which === 13) { // Enter
                if (!selection.selectedDays.length) return;

                if (!this.isOpen) this.openPanel();
                else this.confirm();
            }
        });

        $(document).on('keydown', e => {
            if ([38, 40].includes(e.which)) { // Arrow keys
                if (!this.isOpen) return;
                
                if (e.which === 38) this.previous();
                else if (e.which === 40) this.next();
            }
        });

        $(document).on('mouseenter', '.panel ul li:not([disabled])', e => {
            const $el = $(e.target).closest('li');
            $('.panel ul li.selected').removeClass('selected');
            $el.addClass('selected');
        });

        $(document).on('click', '.panel ul li', e => {
            const $el = $(e.currentTarget);
            if ($el.is('[disabled]')) return false;
            $el.siblings('.picked').removeClass('picked');

            this.confirm();
            return false;
        });

        $(document).on('click', '', () => {
            this.closePanel();
        });
    },

    openPanel() {
        this.isOpen = true;
        $('.panel').html(this.layouts['default']);

        $('.panel [data-tool="add"] span').text(`Add ${selection.selectedDays.length} event${selection.selectedDays.length > 1 ? 's' : ''}…`)

        // Disable replace and remove if selection is empty
        if (selection.allDaysEmpty()) $('.panel li[data-tool="replace"], .panel li[data-tool="remove"]').attr('disabled', true);
        $('.panel-wrap').addClass('visible');
    },

    closePanel() {
        this.isOpen = false;
        $('.panel-wrap').removeClass('visible');
    },

    previous() {
        const $el = $('.panel ul li.selected');
        $el.removeClass('selected');
        if ($el.prev('li:not([disabled])').length) $el.prev('li:not([disabled])').addClass('selected');
        else $el.parent('ul').find('li:not([disabled])').last().addClass('selected');
    },

    next() {
        const $el = $('.panel ul li.selected');
        $el.removeClass('selected');
        if ($el.next('li:not([disabled])').length) $el.next('li:not([disabled])').addClass('selected');
        else $el.parent('ul').find('li:not([disabled])').first().addClass('selected');
    },

    confirm() {
        const tool = $('.panel ul li.selected').attr('data-tool');
        let $html;

        if (tool === 'add') this.addEvent();
        else if (tool === 'add-event') this.addEvent(true);
        else if (tool === 'replace') this.replaceCategory();
        else if (tool === 'from-event') this.replaceCategory(true);
        else if (tool === 'to-event') this.replaceCategory(true, true);
        else if (tool === 'remove') this.removeEvent();
        else if (tool === 'remove-event') this.removeEvent(true);

        $('.panel').html($html);
    },

    buildEventsList(action, filter = false) {
        const $calendars = calendars.editAll ? $('.calendars-wrap .calendar') : $('.calendars-wrap .calendar.selected');

        let list = $('.categories-wrap ul li').map((_, el) => {
            const $el = $(el);
            const type = $el.attr('data-category');
            const count = selection.selectedDays.reduce((acc, curr) => {
                const date = dates.toString(curr);
                const $events = $calendars.find(`.day[data-date="${date}"] .event[data-category="${type}"]`);

                const ids = $events.toArray().map(e => $(e).attr('data-id'));
                ids.map(id => acc.add(id));

                return acc;
            }, new Set()).size;

            return `<li data-tool="${action}-event"><span class="event" data-category="${type}" data-color="${$el.attr('data-color')}"><span class="title">${$el.find('.title').text()}</span></span>${action === 'from' ? `<span class="count">${count}</span>` : ''}</li>`;
        }).toArray();

        if (filter) {
            const eventsInSelection = selection.selectedDays.map(day => $(`.day[data-date="${dates.toString(day)}"] .event`).map((_, el) => $(el).attr('data-category')).toArray()).flat();
            list = list.filter(li => eventsInSelection.includes($(li).find('.event').attr('data-category')));
        }

        return list;
    },

    addEvent(eventSelected = false) {
        if (!eventSelected) {
            const $html = $(this.layouts['add']);
            $html.find('ul').html(this.buildEventsList('add'));
            $html.find('li:first-child').addClass('selected');
            $('.panel').html($html);
            $('.panel .head span').text(`Add ${selection.selectedDays.length} event${selection.selectedDays.length > 1 ? 's' : ''}…`)
        } else {
            const $event = $('.panel li.selected .event');
            const type = parseInt($event.attr('data-category'));
            events.insert(type);
            this.closePanel();
        }
    },

    replaceCategory(from, to) {
        if (!from) {
            // Initiate replacement window
            const $html = $(this.layouts['replace']);

            // Fill "from" list with options
            $html.find('ul.from').html(this.buildEventsList('from', true));
            $html.find('ul.from li:first-child').addClass('selected');
            $('.panel').html($html);
        } else if (!to) {
            // Fill "to" list with options
            $('.panel ul.to').html(this.buildEventsList('to'));

            // Unselect selected "from" option but save it as picked
            $('.panel ul.from li.selected').addClass('picked').removeClass('selected');

            // Don't show picked "from" option in "to" options list (don't replace an event with itself)
            $(`.panel ul.to li .event[data-category="${$('.panel ul.from li.picked .event').attr('data-category')}"]`).parent('li').remove();

            // Select first "to" option
            $('.panel ul.to li:first-child').addClass('selected');
        } else {
            // Replace events
            const from = parseInt($('.panel ul.from li.picked .event').attr('data-category'));
            const to = parseInt($('.panel ul.to li.selected .event').attr('data-category'));

            selection.replaceEvents(from, to);
            this.closePanel();
        }
    },

    removeEvent(eventSelected = false) {
        if (!eventSelected) {
            const $html = $(this.layouts['remove']);
            $html.find('ul').html(this.buildEventsList('remove', true));
            $html.find('li:first-child').addClass('selected');
            $('.panel').html($html);
        } else {
            // Remove events
            const type = parseInt($('.panel ul li.selected .event').attr('data-category'));
            selection.removeEvents(type);
            this.closePanel();
        }
    }
}