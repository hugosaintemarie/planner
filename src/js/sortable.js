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
    
        $parent.children().each((id, el) => {
            const $el = $(el);
            $el.css({
                'top': $el.position().top,
                'left': $el.position().left,
                'width': $el.outerWidth(),
                'height': $el.outerHeight()
            });
        });
    
        $parent.children().each((id, el) => {
            $(el).css('position', 'absolute');
        });
    },
    
    sort(e) {
        const deltaX = e.clientX - this.sortedOrigin.x;
        const deltaY = e.clientY - this.sortedOrigin.y;
    
        this.$sortedEl.css({
            'top': Math.min(Math.max(this.sortedPosition.top + deltaY, this.$sortedEl.parent().offset().top), this.$sortedEl.parent().offset().top + this.$sortedEl.parent().outerHeight() - this.$sortedEl.outerHeight()),
            // 'left': this.sortedPosition.left + deltaX
        });
    
        this.$sortedEl.nextAll().each((id, el) => {
            const $el = $(el);
            if (this.$sortedEl.position().top > $el.position().top - 30) {
                $el.css('top', $el.position().top - this.$sortedEl.outerHeight(true));
                this.$sortedEl.before($el);
            }
        });
    
        this.$sortedEl.prevAll().each((id, el) => {
            const $el = $(el);
            if (this.$sortedEl.position().top < $el.position().top + 30) {
                this.$sortedEl.after($el);
                $el.css('top', $el.position().top + this.$sortedEl.outerHeight(true));
            }
        });
    },
    
    stopSort(e) {
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
                'height': ''
            });
        });
    
        $parent.children().each((id, el) => {
            $(el).css('position', '');
        });
    
        this.$sortedEl = null;
    }
}