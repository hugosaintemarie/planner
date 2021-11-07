<template>
    <div class="flex-1 overflow-hidden">
        <div class="no-scrollbar h-full overflow-auto space-y-6">
            <div
                v-for="calendar in calendars"
                :key="calendar.id"
                class="flex flex-col items-center m-4 rounded-md cursor-pointer"
                :class="
                    selected === calendar.id ? 'text-white' : ' text-gray-400'
                "
                @click="select(calendar.id)"
            >
                <div
                    class="mb-3 w-full border-2 rounded-lg"
                    :class="
                        selected === calendar.id
                            ? 'border-gray-100'
                            : 'border-gray-700'
                    "
                >
                    <div
                        v-for="(week, w) in weeks"
                        :key="w"
                        class="flex"
                        :class="w === 0 ? '' : 'border-t border-gray-700'"
                    >
                        <div
                            v-for="(day, d) in days(week)"
                            :key="d"
                            class="relative flex-1 h-5 overflow-hidden"
                            :class="d === 0 ? '' : 'border-l border-gray-700'"
                        >
                            <div
                                v-if="eventsThatDay(day, calendar)"
                                class="
                                    flex flex-wrap
                                    items-center
                                    justify-center
                                    h-full
                                "
                            >
                                <div
                                    v-for="event in eventsThatDay(
                                        day,
                                        calendar
                                    )"
                                    :key="event.id"
                                    class="
                                        flex-none
                                        m-px
                                        w-1.5
                                        h-1.5
                                        rounded-full
                                    "
                                    :style="`background-color: ${event.category.color}`"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                <span class="whitespace-pre">{{
                    calendar.title || '&nbsp;'
                }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { eachDayOfInterval, eachWeekOfInterval, lastDayOfWeek } from 'date-fns';
export default {
    computed: {
        calendars() {
            return this.$store.state.calendars.list;
        },
        selected() {
            return this.$store.state.calendars.selected;
        },
        weeks() {
            return eachWeekOfInterval(
                {
                    start: new Date(document.getElementById('start').value),
                    end: new Date(document.getElementById('end').value),
                },
                { weekStartsOn: 1 }
            );
        },
    },
    mounted() {
        this.select(0);
    },
    methods: {
        select(id) {
            this.$store.dispatch('calendars/select', id);
        },
        days(week) {
            return eachDayOfInterval({
                start: week,
                end: lastDayOfWeek(week, { weekStartsOn: 1 }),
            });
        },
        eventsThatDay(day, calendar) {
            const events = this.$store.getters['events/onCalendarOnDay'](
                day,
                calendar
            );
            if (events.length) return events;
            else return false;
        },
    },
};
</script>
