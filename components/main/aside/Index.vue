<template>
    <aside
        class="flex flex-col flex-none h-full bg-gray-800 border-r border-gray-700 w-60"
    >
        <MainAsideHeader />
        <div class="flex-1 overflow-hidden">
            <Container
                class="h-full pb-6 overflow-auto no-scrollbar"
                lock-axis="y"
                behaviour="contain"
                @drop="onDrop"
            >
                <Draggable v-for="calendar in calendars" :key="calendar.id">
                    <MainAsideCalendarFull
                        v-if="view === 'full'"
                        :calendar="calendar"
                        :selected="selected"
                        :days="days"
                        :weeks="weeks"
                        :is-selected="isSelected"
                        :selection-classes="selectionClasses"
                        :events-that-day="eventsThatDay"
                        @click.native="select(calendar.id)"
                    />
                    <MainAsideCalendarWeek
                        v-if="view === 'week'"
                        :calendar="calendar"
                        :selected="selected"
                        :days="days"
                        :weeks="weeks"
                        :is-selected="isSelected"
                        :selection-classes="selectionClasses"
                        :events-that-day="eventsThatDay"
                        @click.native="select(calendar.id)"
                    />
                </Draggable>
            </Container>
        </div>
    </aside>
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
        view() {
            return this.$store.state.views.selected;
        },
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
