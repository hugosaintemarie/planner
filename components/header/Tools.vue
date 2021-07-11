<template>
    <div class="flex ml-8 text-lg">
        <div
            v-for="(tool, name) in tools"
            :key="name"
            class="flex items-center justify-center w-14 h-full cursor-pointer"
            :class="
                name === selected
                    ? 'text-white bg-gray-700'
                    : 'text-gray-500 hover:text-gray-400'
            "
            @click="select(name)"
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
