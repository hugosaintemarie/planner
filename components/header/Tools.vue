<template>
    <div class="flex ml-8 text-lg">
        <div
            v-for="(tool, name) in tools"
            :key="name"
            class="flex items-center justify-center h-full cursor-pointer w-14"
            :class="
                name === selected
                    ? 'text-white bg-gray-700'
                    : 'text-gray-500 hover:text-gray-400'
            "
            :data-tooltip="
                tool.tooltip ? `${tool.tooltip}|${tool.shortcut}` : null
            "
            @click="select(name)"
            @mouseenter="$nuxt.$emit('show-tooltip', $event)"
            @mouseleave="$nuxt.$emit('hide-tooltip', $event)"
        >
            <i :class="tool.icon"></i>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        tools() {
            return this.$store.state.tools.list;
        },
        selected() {
            return this.$store.state.tools.selected;
        },
    },
    methods: {
        select(tool) {
            this.$store.dispatch('tools/select', tool);
        },
    },
};
</script>
