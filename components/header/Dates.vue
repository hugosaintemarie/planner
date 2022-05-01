<template>
    <div class="flex items-center px-4">
        <input
            id="start"
            type="date"
            name="start"
            class="px-2 py-1 text-gray-500 bg-gray-900 rounded-sm"
            :value="start"
        />
        <i class="mx-2 text-sm text-gray-600 fas fa-arrow-right"></i>
        <input
            id="end"
            type="date"
            name="end"
            class="px-2 py-1 text-gray-500 bg-gray-900 rounded-sm"
            :value="end"
        />
    </div>
</template>

<script>
export default {
    computed: {
        start() {
            return this.$store.getters['settings/get']('start');
        },
        end() {
            return this.$store.getters['settings/get']('end');
        },
    },
};
</script>

<style lang="scss" scoped>
input {
    &::-webkit-calendar-picker-indicator {
        opacity: 0;
    }
}
</style>
