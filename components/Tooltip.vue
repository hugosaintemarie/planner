<template>
    <div
        id="tooltip"
        class="absolute z-40 px-2 py-1.5 text-white bg-black rounded pointer-events-none whitespace-nowrap"
        :style="`left: ${x}px; top: ${y}px`"
        :class="[!visible ? 'opacity-0' : '', classes]"
    >
        <div
            class="absolute w-3 h-3 bg-black rounded-tl-sm"
            :class="tipClasses"
        ></div>
        <div class="flex items-center gap-2">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="tooltip"></div>
            <span v-if="shortcut" class="ml-2 text-gray-500">
                {{ shortcut }}
            </span>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            tooltip: null,
            shortcut: null,
            classes: null,
            tipClasses: null,
            x: 0,
            y: 0,
            side: null,
            timeout: null,
        };
    },
    mounted() {
        this.$nuxt.$on('show-tooltip', (e) => {
            const attribute = e.target.dataset.tooltip;
            if (!attribute) return;

            const side = e.target.dataset.tooltipSide || 'bottom';
            this.side = side;

            const [tooltip, shortcut] = attribute.split('|');
            const html = e.target.dataset.tooltipHtml || tooltip;

            this.shortcut = shortcut;
            this.tooltip = html;

            const rect = e.target.getBoundingClientRect();

            if (side === 'bottom') {
                this.x = rect.x + rect.width / 2;
                this.y = rect.y + rect.height;
                this.classes = '-translate-x-1/2 mt-2';
                this.tipClasses =
                    '-top-3 left-1/2 rotate-45 -translate-x-1/2 translate-y-1/2';
            } else if (side === 'left') {
                this.x = rect.x;
                this.y = rect.y + rect.height / 2;
                this.classes = '-translate-x-full -translate-y-1/2 -ml-2';
                this.tipClasses =
                    'top-1/2 -right-3 rotate-[135deg] -translate-x-1/2 -translate-y-1/2';
            }

            clearTimeout(this.timeout);

            this.timeout = setTimeout(() => {
                this.visible = true;
            }, 500);
        });
        this.$nuxt.$on('hide-tooltip', (e) => {
            if (e.toElement?.dataset.tooltip) return;

            clearTimeout(this.timeout);
            this.visible = false;
        });
    },
    beforeDestroy() {
        this.$nuxt.$off('show-tooltip');
        this.$nuxt.$off('hide-tooltip');
    },
};
</script>
