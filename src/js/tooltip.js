export default{
    $tooltip: null,

    init() {
        // Find tooltip element
        this.$tooltip = $('.tooltip');

        // Hover a tooltiped element
        $(document).on('mouseenter', '[data-tooltip]', e => this.show(e));

        // Leave a tooltiped element
        $(document).on('mouseout', '[data-tooltip]', e => {
            // Make sure we're not only hovering a child element to tooltiped element (or leaving it)
            if ($(e.relatedTarget).is('[data-tooltip]') || $(e.relatedTarget).parents('[data-tooltip]').length) return;

            this.hide();
        });
    },

    show(e) {
        const $el = $(e.currentTarget);
        const text = $el.attr('data-tooltip');
        const side = $el.attr('data-tooltip-side') || 'bottom';

        this.$tooltip.find('.tooltip-content').html(text);

        let top = 0;
        let left = 0;
        const margin = 8;
        
        if (side === 'top') {
            top = $el.offset().top - this.$tooltip.outerHeight() - margin;
            left = $el.offset().left + $el.outerWidth() / 2 - this.$tooltip.outerWidth() / 2;
        } else if (side === 'right') {
            top = $el.offset().top + $el.outerHeight() / 2 - this.$tooltip.outerHeight() / 2;
            left =  $el.offset().left + $el.outerWidth() + margin;
        } else if (side === 'bottom') {
            top = $el.offset().top + $el.outerHeight() + margin;
            left = $el.offset().left + $el.outerWidth() / 2 - this.$tooltip.outerWidth() / 2;
        } else if (side === 'left') {
            top = $el.offset().top + $el.outerHeight() / 2 - this.$tooltip.outerHeight() / 2;
            left = $el.offset().left - this.$tooltip.outerWidth() - margin;
        }
        
        this.$tooltip
        .css({
            'top': top,
            'left': left
        })
        .removeClass('top right bottom left').addClass(side)
        .addClass('visible');
    },

    hide() {
        this.$tooltip.removeClass('visible');
    }
}