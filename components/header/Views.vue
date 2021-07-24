<template>
    <div class="flex ml-auto text-lg">
        <div
            v-for="(view, name) in views"
            :key="name"
            class="flex items-center justify-center w-14 h-full cursor-pointer"
            :class="
                name === selected
                    ? 'text-white bg-gray-700'
                    : 'text-gray-500 hover:text-gray-400'
            "
            :data-tooltip="
                view.tooltip ? `${view.tooltip}|${view.shortcut}` : null
            "
            @click="select(name)"
            @mouseenter="$nuxt.$emit('show-tooltip', $event)"
            @mouseleave="$nuxt.$emit('hide-tooltip', $event)"
        >
            <i :class="view.icon"></i>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        views() {
            return this.$store.state.views.list;
        },
        selected() {
            return this.$store.state.views.selected;
        },
    },
    methods: {
        select(view) {
            this.$store.dispatch('views/select', view);
        },
    },
};
</script>
