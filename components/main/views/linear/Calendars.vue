<template>
    <div class="relative flex w-fit">
        <MainViewsLinearAside />
        <div class="flex-1 -ml-px">
            <div
                v-for="calendar in calendars"
                :key="calendar.id"
                class="flex overflow-hidden border-b border-gray-700 divide-x divide-gray-700 h-44 w-fit snap-start"
            >
                <div
                    v-for="day in daysShown"
                    :key="day.valueOf()"
                    class="flex-none"
                    :style="`width: ${dayWidth}px`"
                ></div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    addDays,
    eachDayOfInterval,
    endOfDay,
    format,
    isEqual,
    isWeekend,
    isWithinInterval,
    getDate,
    getDay,
    lastDayOfWeek,
    parseISO,
    startOfDay,
    subDays,
} from 'date-fns';

export default {
    data() {
        return {
            dayWidth: 128,
        };
    },
    computed: {
        calendars() {
            return this.$store.getters['calendars/all'];
        },
        daysShown() {
            const days = eachDayOfInterval(
                {
                    start: parseISO(
                        this.$store.getters['settings/get']('start')
                    ),
                    end: parseISO(this.$store.getters['settings/get']('end')),
                },
                { weekStartsOn: 1 }
            );
            const shown = this.$store.getters['views/days'];
            return days.filter((day) => shown[day.getDay()].checked);
        },
        selected() {
            return this.$store.getters['selection/selected'];
        },
        tool() {
            return this.$store.getters['tools/selected'];
        },
    },
    methods: {
        days(week) {
            const shown = this.$store.getters['views/days'];
            return eachDayOfInterval({
                start: week,
                end: lastDayOfWeek(week, { weekStartsOn: 1 }),
            }).filter((_d, i) => shown[i].checked);
        },
        format(day, args) {
            return format(day, args);
        },
        startOfDay(day) {
            return startOfDay(day);
        },
        endOfDay(day) {
            return endOfDay(day);
        },
        isWeekend(day) {
            return isWeekend(day);
        },
        isWithinBounds(day) {
            return isWithinInterval(day, {
                start: parseISO(this.$store.getters['settings/get']('start')),
                end: parseISO(this.$store.getters['settings/get']('end')),
            });
        },
        isStart(event, day) {
            return event.start.getTime() === startOfDay(day).getTime();
        },
        isEnd(event, day) {
            return event.end.getTime() === endOfDay(day).getTime();
        },
        monthsDivider(day) {
            // TODO: move condition
            const showMonthsDivider = false;

            if (!showMonthsDivider) return;

            let classes = '';
            if (this.isFirstOfMonthRow(day)) classes += 'border-t-gray-500';
            if (this.isFirstOfMonth(day)) classes += ' border-l-gray-500';
            return classes;
        },
        isFirstOfMonthRow(day) {
            return getDate(day) <= 7;
        },
        isFirstOfMonth(day) {
            return getDate(day) === 1 && getDay(day) !== 1;
        },
        isFirstOfWeek(day) {
            return getDay(day) === 1;
        },
        isSelected(day) {
            return this.selected.some(
                (d) =>
                    isEqual(d.start, startOfDay(day)) &&
                    isEqual(d.end, endOfDay(day))
            );
        },
        selectionClasses(day) {
            let classes =
                'bg-blue-400/10 absolute z-10 -left-px -top-px border-blue-400 pointer-events-none';

            if (!this.isSelected(subDays(day, 7))) classes += ' border-t';
            if (!this.isSelected(subDays(day, 1)) || day.getDay() === 1)
                classes += ' border-l';
            if (!this.isSelected(addDays(day, 1)) || day.getDay() === 0)
                classes += ' border-r';
            if (!this.isSelected(addDays(day, 7))) classes += ' border-b';

            return classes;
        },
        mousedownDay(day) {
            if (this.tool === 'select') this.mousedownDaySelect(day);
            else if (this.tool === 'draw') this.mousedownDayDraw(day);
        },
        mousedownDaySelect(day) {
            const interval = {
                start: startOfDay(day),
                end: endOfDay(day),
            };

            if (this.$store.getters['keyboard/isKeydown']('shift')) {
                if (!this.$store.getters['keyboard/isKeydown']('meta'))
                    this.$store.dispatch('selection/unselectAll', interval);
                this.$store.dispatch('selection/selectDaysRect', interval);
            } else if (this.$store.getters['keyboard/isKeydown']('alt')) {
                this.$store.dispatch('selection/unselectAll', interval);
                this.$store.dispatch('selection/selectDaysRange', interval);
            } else if (this.$store.getters['keyboard/isKeydown']('meta')) {
                if (this.isSelected(day)) {
                    this.unselect = true;
                    this.$store.dispatch('selection/unselect', interval);
                } else {
                    this.unselect = false;
                    this.$store.dispatch('selection/select', interval);
                    this.$store.dispatch('selection/anchor', interval);
                }
            } else {
                this.$store.dispatch('selection/unselectAll');
                this.$store.dispatch('selection/select', interval);
                this.$store.dispatch('selection/anchor', interval);
                this.$store.dispatch('selection/target', interval);
            }

            this.mouseenterDay(day);
        },
        mousedownDayDraw(day) {
            this.$store.dispatch('events/init', day);
        },
        mouseenterDay(day) {
            if (this.mousedown) {
                if (this.tool === 'select') this.mouseenterDaySelect(day);
                else if (this.tool === 'draw') this.mouseenterDayDraw(day);
            }
        },
        mouseenterDaySelect(day) {
            const interval = {
                start: startOfDay(day),
                end: endOfDay(day),
            };

            if (this.$store.getters['keyboard/isKeydown']('meta')) {
                if (this.unselect)
                    this.$store.dispatch('selection/unselect', interval);
                else this.$store.dispatch('selection/select', interval);
            } else if (this.$store.getters['keyboard/isKeydown']('alt')) {
                this.$store.dispatch('selection/unselectAll');
                this.$store.dispatch('selection/selectDaysRange', interval);
            } else {
                this.$store.dispatch('selection/unselectAll');
                this.$store.dispatch('selection/selectDaysRect', interval);
            }
        },
        mouseenterDayDraw(day) {
            this.$store.dispatch('events/draw', day);
        },
        dblclickDay(day) {
            if (this.tool === 'select') return;

            const selection = [
                {
                    start: startOfDay(day),
                    end: endOfDay(day),
                },
            ];
            this.$store.dispatch('events/add', { selection, fullDay: true });
        },
        eventsThatDay(day) {
            let events = this.$store.getters['events/onCalendarOnDay'](day);
            if (!events.length) return false;

            events = events.sort((a, b) => a.start - b.start);
            events = events.sort((d) => (d.fullDay ? 0 : 1));
            return events;
        },
        mousedownEvent(event) {
            if (this.tool === 'draw') {
                console.log('mousedown', event);
            }
        },
        dblclickEvent(event) {
            if (this.tool === 'draw') {
                console.log('dblclick', event);
            }
        },
    },
};
</script>
