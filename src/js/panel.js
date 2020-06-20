import selection from './selection';

export default {
    isOpen: false,

    init() {
        $(document).on('keypress', e => {
            if (e.which === 13) {                     // Enter
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

        $(document).on('mousemove', '.panel ul li', e => {
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
        $('.panel-wrap').addClass('visible');
    },

    closePanel() {
        this.isOpen = false;
        $('.panel-wrap').removeClass('visible');
    },

    previous() {
        const $el = $('.panel ul li.selected');
        if ($el.prev().length) $el.prev().addClass('selected');
        else $el.parent('ul').find('li:last-child').addClass('selected');
        $el.removeClass('selected');
    },

    next() {
        const $el = $('.panel ul li.selected');
        if ($el.next().length) $el.next().addClass('selected');
        else $el.parent('ul').find('li:first-child').addClass('selected');
        $el.removeClass('selected');
    },

    confirm() {
        this.closePanel();
    }
}