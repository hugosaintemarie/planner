<template>
    <div class="flex items-center px-4">
        <input
            id="start"
            v-model="start"
            type="date"
            name="start"
            class="px-2 py-1 text-gray-500 bg-gray-900 rounded-sm"
        />
        <i class="mx-2 text-sm text-gray-600 fas fa-arrow-right"></i>
        <input
            id="end"
            v-model="end"
            type="date"
            name="end"
            class="px-2 py-1 text-gray-500 bg-gray-900 rounded-sm"
        />
    </div>
</template>

<script>
export default {
    computed: {
        start: {
            get() {
                return this.$store.getters['settings/get']('start');
            },
            set(value) {
                return this.$store.dispatch('settings/set', {
                    key: 'start',
                    value,
                });
            },
        },
        end: {
            get() {
                return this.$store.getters['settings/get']('end');
            },
            set(value) {
                return this.$store.dispatch('settings/set', {
                    key: 'end',
                    value,
                });
            },
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
