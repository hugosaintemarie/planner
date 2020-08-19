import calendars from './calendars';
import data from './data';
import events from './events';
import stats from './stats';

export default {
    $sortedEl: null,
    sortedPosition: {},
    sortedOrigin: {},

    init() {
        $(document).on('mousedown', '.sortable i[data-tool="sort"]', e => {
            this.startSort(e);
        });
        
        $(document).on('mouseup', e => {
            if (this.$sortedEl) this.stopSort(e);
        });
        
        $(document).on('mousemove', e => {
            if (this.$sortedEl) this.sort(e);
        });
    },
    
    startSort(e) {
        const $icon = $(e.target);
        this.$sortedEl = $icon.closest('.sortable');

        this.$sortedEl.addClass('sorting');
        
        // Ignore sort if only child
        if (this.$sortedEl.is(':only-child')) return;
    
        this.sortedPosition = this.$sortedEl.position();
        
        this.sortedOrigin = {
            x: e.clientX,
            y: e.clientY
        };
    
        $icon.css('cursor', 'grabbing');
    
        this.$sortedEl.css('zIndex', '1');
    
        const $parent = this.$sortedEl.parent();
    
        this.$sortedEl.parent().css({
            'width': $parent.outerWidth(),
            'height': $parent.outerHeight()
        });
    
        $parent.children().each((_, el) => {
            const $el = $(el);
            $el.css({
                'top': $el.position().top,
                'left': $el.position().left,
                'width': $el.outerWidth(),
                // 'height': $el.outerHeight()
            });
        });
    
        $parent.children().each((_, el) => {
            $(el).css('position', 'absolute');
        });
    },
    
    sort(e) {
        // const deltaX = e.clientX - this.sortedOrigin.x;
        const deltaY = e.clientY - this.sortedOrigin.y;
    
        this.$sortedEl.css({
            'top': Math.min(Math.max(this.sortedPosition.top + deltaY, this.$sortedEl.parent().position().top + parseInt(this.$sortedEl.parent().css('marginTop'), 10)), this.$sortedEl.parent().position().top + parseInt(this.$sortedEl.parent().css('marginTop'), 10) + this.$sortedEl.parent().outerHeight() - this.$sortedEl.outerHeight(true)),
            // 'left': this.sortedPosition.left + deltaX
        });
    
        this.$sortedEl.nextAll().each((_, el) => {
            const $el = $(el);
            if (this.$sortedEl.position().top + this.$sortedEl.outerHeight() > $el.position().top + $el.outerHeight() / 2) {
                $el.css('top', $el.position().top - this.$sortedEl.outerHeight(true));
                this.$sortedEl.before($el);
            }
        });
    
        this.$sortedEl.prevAll().each((_, el) => {
            const $el = $(el);
            if (this.$sortedEl.position().top < $el.position().top + $el.outerHeight() / 2) {
                this.$sortedEl.after($el);
                $el.css('top', $el.position().top + this.$sortedEl.outerHeight(true));
            }
        });
    },
    
    stopSort(e) {
        $(e.target).css('cursor', '');

        this.$sortedEl.css({
            'cursor': '',
            'zIndex': ''
        });
        
        const $parent = this.$sortedEl.parent();
    
        this.$sortedEl.parent().css({
            'width': '',
            'height': ''
        });
    
        $parent.children().each((id, el) => {
            const $el = $(el);
            $el.css({
                'top': '',
                'left': '',
                'width': '',
                // 'height': '',
                'position': ''
            });

            $el.attr('data-order', id);
        });

        if ($parent.parents('.calendars-wrap').length) calendars.reorder();
        else if ($parent.parents('.events-wrap').length) events.reorder();

        this.$sortedEl.removeClass('sorting');
    
        this.$sortedEl = null;

        stats.update();
        data.save();
    }
}