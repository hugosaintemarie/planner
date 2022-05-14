<template>
    <div class="flex-1 overflow-hidden">
        <Container
            class="h-full pb-6 overflow-auto no-scrollbar"
            lock-axis="y"
            behaviour="contain"
            @drop="onDrop"
        >
            <Draggable v-for="calendar in calendars" :key="calendar.id">
                <div
                    class="flex flex-col items-center m-4 rounded-md cursor-pointer"
                    :class="
                        selected === calendar.id
                            ? 'text-white'
                            : ' text-gray-400'
                    "
                    @click="select(calendar.id)"
                >
                    <div
                        class="w-full mb-3 overflow-hidden bg-gray-800 border-2 rounded-lg"
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
                                :class="
                                    d === 0 ? '' : 'border-l border-gray-700'
                                "
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
                                    class="flex flex-wrap items-center justify-center h-full"
                                >
                                    <div
                                        v-for="event in eventsThatDay(
                                            day,
                                            calendar
                                        )"
                                        :key="event.id"
                                        class="flex-none m-px w-1.5 h-1.5 rounded-full"
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
            </Draggable>
        </Container>
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
    parseISO,
    startOfDay,
    subDays,
} from 'date-fns';

// eslint-disable-next-line import/no-absolute-path
import { applyDrag } from '/plugins/draggable-utils';

export default {
    computed: {
        calendars: {
            get() {
                return this.$store.state.calendars.list;
            },
            set(value) {
                this.$store.commit('calendars/update', value);
            },
        },
        selected() {
            return this.$store.state.calendars.selected;
        },
        weeks() {
            return eachWeekOfInterval(
                {
                    start: parseISO(
                        this.$store.getters['settings/get']('start')
                    ),
                    end: parseISO(this.$store.getters['settings/get']('end')),
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
        // dragOptions() {
        //     return {
        //         animation: 200,
        //     };
        // },
    },
    mounted() {
        this.select(0);
    },
    methods: {
        onDrop(dropResult) {
            this.calendars = applyDrag(this.calendars, dropResult);
        },
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
