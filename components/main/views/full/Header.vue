<template>
    <div class="flex items-baseline">
        <div class="relative h-5">
            <input
                v-model="title"
                size="1"
                class="absolute w-full font-semibold bg-transparent rounded-sm outline-none selection:bg-gray-600 focus:ring-2 ring-gray-400 ring-offset-4 ring-offset-gray-900"
            />
            <span class="invisible font-semibold whitespace-pre">{{
                title || '&nbsp;'
            }}</span>
        </div>
        <p class="ml-3 text-xs text-gray-400">Add a description</p>
    </div>
</template>

<script>
export default {
    computed: {
        calendar() {
            return this.$store.getters['calendars/selected'];
        },
        title: {
            get() {
                return this.calendar.title;
            },
            set(value) {
                this.$store.dispatch('calendars/rename', value);
            },
        },
        tool() {
            return this.$store.getters['tools/selected'];
        },
    },
};
</script>
