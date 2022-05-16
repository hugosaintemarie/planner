<template>
    <div class="flex p-4 border-b border-gray-700">
        <div class="flex-1 select-none">
            <h1 class="font-semibold">Calendars</h1>
            <p class="text-xs text-gray-400">{{ count }} calendars, 2 hidden</p>
        </div>
        <div class="flex items-center">
            <i
                class="flex items-center justify-center w-8 h-8 text-base text-gray-500 border border-gray-700 rounded cursor-pointer far fa-calendar-plus hover:text-white hover:bg-gray-700"
                @click="add"
            ></i>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        count() {
            return Object.keys(this.$store.state.calendars.list).length;
        },
        view() {
            return this.$store.state.views.selected;
        },
    },
    methods: {
        add() {
            this.$store.dispatch('calendars/add');
        },
    },
};
</script>
