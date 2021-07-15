<template>
    <div class="flex-1 overflow-hidden">
        <div class="h-full overflow-auto">
            <div
                v-for="calendar in calendars"
                :key="calendar.id"
                class="p-4 cursor-pointer"
                :class="
                    selected === calendar.id
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-300'
                "
                @click="select(calendar.id)"
            >
                <span class="whitespace-pre">{{
                    calendar.title || '&nbsp;'
                }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        calendars() {
            return this.$store.state.calendars.list;
        },
        selected() {
            return this.$store.state.calendars.selected;
        },
    },
    mounted() {
        this.select(0);
    },
    methods: {
        select(id) {
            this.$store.dispatch('calendars/select', id);
        },
    },
};
</script>
