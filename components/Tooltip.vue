<template>
    <div
        id="tooltip"
        class="
            absolute
            z-10
            px-2
            py-1.5
            text-white
            bg-black
            rounded
            pointer-events-none
            overflow-visible
            -translate-x-1/2
        "
        :style="`left: ${x}px; top: ${y}px`"
        :class="!visible ? 'opacity-0' : ''"
    >
        <div
            class="
                absolute
                -top-3
                left-1/2
                w-3
                h-3
                bg-black
                rounded-tl-sm
                transform
                origin-bottom-left
            "
            style="transform: translate(calc(-50% - 0.165rem)) rotate(45deg)"
        ></div>
        {{ tooltip }}
        <span v-if="shortcut" class="ml-2 text-gray-500">{{ shortcut }}</span>
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
            timeout: null,
        };
    },
    mounted() {
        this.$nuxt.$on('show-tooltip', (e) => {
            const attribute = e.target.dataset.tooltip;
            if (!attribute) return;

            const [tooltip, shortcut] = attribute.split('|');

            this.tooltip = tooltip;
            this.shortcut = shortcut;

            this.x = e.target.offsetLeft + e.target.offsetWidth / 2;
            this.y = e.target.offsetTop + e.target.offsetHeight + 8;

            clearTimeout(this.timeout);

            this.timeout = setTimeout(() => {
                this.visible = true;
            }, 1000);
        });
        this.$nuxt.$on('hide-tooltip', (e) => {
            if (e.toElement.dataset.tooltip) return;

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
