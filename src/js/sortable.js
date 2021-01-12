import calendars from './calendars';
import categories from './categories';
import data from './data';
import stats from './stats';
import tooltip from './tooltip';

export default {
    $sortedEl: null,
    sortedPosition: {},
    sortedOrigin: {},
    parentScroll: null,

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

        $('.scroll-wrap').on('scroll', e => {
            if (this.$sortedEl) this.sort(e);
        });
    },
    
    startSort(e) {
        tooltip.hide();
        
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
        this.parentScroll = this.$sortedEl.parents('.scroll-wrap').scrollTop() || 0;
    
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

        if (e.clientY) this.lastClientY = e.clientY;

        const scrollDeltaY = this.parentScroll - (this.$sortedEl.parents('.scroll-wrap').scrollTop() || 0);
        const deltaY = this.sortedPosition.top + this.lastClientY - this.sortedOrigin.y - scrollDeltaY;
        const maxTop = this.$sortedEl.parent().outerHeight() - this.$sortedEl.outerHeight(true);

        const top = Math.min(Math.max(deltaY, 0), maxTop);
    
        this.$sortedEl.css({
            'top': top,
            // 'left': left
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

        $parent.scrollTop(this.parentScroll);

        if ($parent.parents('.calendars-wrap').length) calendars.reorder();
        else if ($parent.parents('.categories-wrap').length) categories.reorder();

        this.$sortedEl.removeClass('sorting');
    
        this.$sortedEl = null;

        stats.update();
        data.save();
    }
}