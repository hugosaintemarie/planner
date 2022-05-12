<template>
    <div
        id="tooltip"
        class="absolute z-40 px-2 py-1.5 text-white bg-black rounded pointer-events-none overflow-visible whitespace-nowrap"
        :style="`left: ${x}px; top: ${y}px`"
        :class="[!visible ? 'opacity-0' : '']"
    >
        <div
            class="absolute w-3 h-3 bg-black rounded-tl-sm"
            :class="[
                side === 'bottom'
                    ? '-top-3 left-1/2 rotate-45 -translate-x-1/2 translate-y-1/2'
                    : side === 'left'
                    ? 'top-1/2 -right-3 rotate-[135deg] -translate-x-1/2 -translate-y-1/2'
                    : '',
            ]"
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

            setTimeout(() => {
                const rect = document
                    .getElementById('tooltip')
                    .getBoundingClientRect();

                if (side === 'bottom') {
                    this.x =
                        e.target.offsetLeft +
                        e.target.offsetWidth / 2 -
                        rect.width / 2;
                    this.y = e.target.offsetTop + e.target.offsetHeight + 8;
                } else if (side === 'left') {
                    this.x = e.target.offsetLeft - 8 - rect.width;
                    this.y =
                        e.target.offsetTop -
                        rect.height / 2 +
                        e.target.offsetHeight / 2;
                }
            }, 0);

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
