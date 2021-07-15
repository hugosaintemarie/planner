<template>
    <div>
        <MainViewsWeek v-if="view === 'week'" />
        <MainViewsFull v-if="view === 'full'" />
        <MainViewsLinear v-if="view === 'linear'" />
    </div>
</template>

<script>
export default {
    computed: {
        view() {
            return this.$store.state.views.selected;
        },
    },
};
</script>
