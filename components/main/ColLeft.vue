<template>
    <div class="flex flex-col h-full bg-gray-800 border-r border-gray-700">
        <div class="flex p-4 border-b border-gray-700">
            <div class="flex-1 select-none">
                <h1 class="font-semibold">Calendars</h1>
                <p class="text-gray-400 text-xs">
                    {{ count }} calendars, 2 hidden
                </p>
            </div>
            <div class="flex items-center">
                <i
                    class="
                        far
                        fa-calendar-plus
                        flex
                        items-center
                        justify-center
                        w-8
                        h-8
                        text-gray-500
                        hover:text-white
                        text-base
                        hover:bg-gray-700
                        border border-gray-700
                        rounded
                        cursor-pointer
                    "
                    @click="add"
                ></i>
            </div>
        </div>
        <MainViewsColLeftFull v-if="view === 'full' || view === 'week'" />
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
    mounted() {
        for (let i = 0; i < 10; i += 1) {
            this.add();
        }
    },
    methods: {
        add() {
            this.$store.dispatch('calendars/add');
        },
    },
};
</script>
