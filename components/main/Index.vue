<template>
    <main class="flex flex-1 overflow-hidden select-none">
        <MainViewsWeek v-if="view === 'week'" />
        <MainViewsFull v-if="view === 'full'" />
        <MainViewsLinear v-if="view === 'linear'" />

        <MainSidebar />
    </main>
</template>

<script>
export default {
    computed: {
        view() {
            return this.$store.state.views.selected;
        },
    },
    mounted() {
        for (let i = 0; i < 10; i += 1) {
            this.$store.dispatch('calendars/add');
        }
        this.$store.dispatch('calendars/select', 0);
    },
};
</script>
