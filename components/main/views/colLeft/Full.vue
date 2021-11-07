<template>
    <div class="flex-1 overflow-hidden">
        <draggable
            v-model="cals"
            v-bind="dragOptions"
            class="no-scrollbar pb-6 h-full overflow-auto space-y-6"
        >
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
                    class="
                        mb-3
                        w-full
                        bg-gray-800
                        border-2
                        rounded-lg
                        overflow-hidden
                    "
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
                            class="relative flex-1 h-5"
                            :class="d === 0 ? '' : 'border-l border-gray-700'"
                        >
                            <div
                                v-if="isSelected(day)"
                                :class="selectionClasses(day, calendar.id)"
                                style="
                                    height: calc(100% + 2px);
                                    width: calc(100% + 2px);
                                "
                            ></div>
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
        </draggable>
    </div>
</template>

<script>
import {
    addDays,
    eachDayOfInterval,
    endOfDay,
    eachWeekOfInterval,
    isEqual,
    lastDayOfWeek,
    startOfDay,
    subDays,
} from 'date-fns';
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
        cals: {
            get() {
                return this.$store.state.calendars.list;
            },
            set(value) {
                this.$store.commit('calendars/update', value);
            },
        },
        dragOptions() {
            return {
                animation: 200,
            };
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
        isSelected(day) {
            return this.$store.getters['selection/selected'].some(
                (d) =>
                    isEqual(d.start, startOfDay(day)) &&
                    isEqual(d.end, endOfDay(day))
            );
        },
        selectionClasses(day, calendar) {
            let classes =
                'bg-blue-400/10 absolute z-10 -left-px -top-px pointer-events-none';

            if (calendar !== this.selected) return classes;

            classes += ' border-blue-400';

            if (!this.isSelected(subDays(day, 7))) classes += ' border-t';
            if (!this.isSelected(subDays(day, 1)) || day.getDay() === 1)
                classes += ' border-l';
            if (!this.isSelected(addDays(day, 1)) || day.getDay() === 0)
                classes += ' border-r';
            if (!this.isSelected(addDays(day, 7))) classes += ' border-b';

            return classes;
        },
    },
};
</script>
