import dates from './dates';
import events from './events';
import selection from './selection';

export default {
    isOpen: false,
    layouts: {
        default: `<ul>
            <li data-tool="add" class="selected"><i class="fas fa-plus"></i>Add event…</li>
            <li data-tool="replace"><i class="fas fa-sync-alt"></i>Replace event…</li>
            <li data-tool="fill" disabled><i class="far fa-calendar-plus"></i>Fill empty days…</li>
            <li data-tool="count" class="border-top" disabled><i class="fa fa-calculator"></i>Count occurences…</li>
        </ul>`,
        add: `<div>
            <span>Add event…</span>
            <ul></ul>
        </div>`,
        replace: `<div class="row">
            <div>
                <span>Replace…</span>
                <ul class="from"></ul>
            </div>
            <div>
                <span>With…</span>
                <ul class="to"></ul>
            </div>
        </div>`,
        count: `<div>
            <span>Count occurences of…</span>
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

        $(document).on('mousemove', '.panel ul li:not([disabled])', e => {
            const $el = $(e.target).closest('li');
            $('.panel ul li.selected').removeClass('selected');
            $el.addClass('selected');
        });

        $(document).on('click', '.panel ul li', () => {
            this.confirm();
        });
    },

    openPanel() {
        this.isOpen = true;
        $('.panel').html(this.layouts['default']);

        if (selection.allDaysEmpty()) $('.panel li[data-tool="replace"]').attr('disabled', true);
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
        // console.log(tool);
        let $html;

        if (tool === 'add') this.addEvent();
        else if (tool === 'add-event') this.addEvent(true);
        else if (tool === 'replace') this.replace();
        else if (tool === 'from-event') this.replace(true);
        else if (tool === 'to-event') this.replace(true, true);

        $('.panel').html($html);
    },

    buildEventsList(action, filter = false) {
        let list = $('.events-wrap ul li').map((id, el) => {
            const $el = $(el);
            return `<li data-tool="${action}-event"><span class="event" data-type="${$el.attr('data-type')}" style="background-color: ${$el.css('background-color')}"><span class="title">${$el.find('.title').text()}</span></span></li>`;
        }).toArray();

        if (filter) {
            const eventsInSelection = selection.selectedDays.map(day => $(`.calendar-wrap .day[data-date="${dates.toString(day)}"] .event`).map((id, el) => $(el).attr('data-type')).toArray()).flat();
            list = list.filter(li => eventsInSelection.includes($(li).find('.event').attr('data-type')));
        }

        return list;
    },

    addEvent(eventSelected = false) {
        if (!eventSelected) {
            const $html = $(this.layouts['add']);
            $html.find('ul').html(this.buildEventsList('add'));
            $html.find('li:first-child').addClass('selected');
            $('.panel').html($html);
        } else {
            const $event = $('.panel li.selected .event');
            events.insertEvent($event);
            this.closePanel();
        }
    },

    replace(from, to) {
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
            $(`.panel ul.to li .event[data-type="${$('.panel ul.from li.picked .event').attr('data-type')}"]`).parent('li').remove();

            // Select first "to" option
            $('.panel ul.to li:first-child').addClass('selected');
        } else {
            // Replace events
            const from = parseInt($('.panel ul.from li.picked .event').attr('data-type'));
            const to = parseInt($('.panel ul.to li.selected .event').attr('data-type'));

            selection.replaceEvents(from, to);
            this.closePanel();
        }
    }
}