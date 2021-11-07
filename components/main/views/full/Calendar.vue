<template>
    <div class="flex-1 overflow-hidden">
        <div class="no-scrollbar pb-4 h-full overflow-auto">
            <div
                class="border-b border-r border-gray-700"
                :style="tool === 'select' ? 'cursor: cell' : ''"
                @mousedown="mousedown = true"
                @mouseup="mousedown = false"
            >
                <div v-for="(week, w) in weeks" :key="w" class="flex">
                    <div
                        v-for="(day, d) in days(week)"
                        :key="d"
                        class="
                            relative
                            flex-1
                            p-2
                            h-40
                            border-l border-t border-gray-700
                        "
                        :class="[
                            isWeekend(day)
                                ? isWithinBounds(day)
                                    ? 'bg-gray-800'
                                    : 'bg-gray-800/50'
                                : '',
                            monthsDivider(day),
                        ]"
                        @mousedown="isWithinBounds(day) && mousedownDay(day)"
                        @mouseenter="isWithinBounds(day) && mouseenterDay(day)"
                    >
                        <div
                            v-if="isSelected(day)"
                            :class="selectionClasses(day)"
                            style="
                                height: calc(100% + 2px);
                                width: calc(100% + 2px);
                            "
                        ></div>
                        <p
                            class="text-xs select-none uppercase"
                            :class="
                                isWithinBounds(day)
                                    ? 'text-gray-500'
                                    : 'text-gray-700'
                            "
                        >
                            {{ format(day, 'd MMM') }}
                        </p>
                        <div v-if="eventsThatDay(day)" class="mt-1 space-y-1">
                            <div
                                v-for="event in eventsThatDay(day)"
                                :key="event.id"
                            >
                                <div
                                    v-if="event.fullDay"
                                    class="px-2 py-1 rounded select-none"
                                    :style="`background-color: ${event.category.bgColor}`"
                                >
                                    <p
                                        class="font-semibold"
                                        :style="`color: ${event.category.textColor}`"
                                    >
                                        {{ event.category.title }}
                                    </p>
                                </div>
                                <div v-if="!event.fullDay" class="flex">
                                    <div
                                        class="
                                            flex-none
                                            mr-2
                                            mt-1.5
                                            w-2
                                            h-2
                                            rounded-full
                                        "
                                        :style="`background-color: ${event.category.color}`"
                                    ></div>
                                    <p
                                        class="flex flex-1"
                                        :style="`color: ${event.category.textColor}`"
                                    >
                                        <span class="font-semibold">
                                            {{ event.category.title }}
                                        </span>
                                        <span class="ml-auto">
                                            {{
                                                event.start.toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    }
                                                )
                                            }}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    addDays,
    eachDayOfInterval,
    eachWeekOfInterval,
    endOfDay,
    format,
    isEqual,
    isWeekend,
    isWithinInterval,
    getDate,
    getDay,
    lastDayOfWeek,
    startOfDay,
    subDays,
} from 'date-fns';

export default {
    data() {
        return {
            mousedown: false,
        };
    },
    computed: {
        weeks() {
            return eachWeekOfInterval(
                {
                    start: new Date(document.getElementById('start').value),
                    end: new Date(document.getElementById('end').value),
                },
                { weekStartsOn: 1 }
            );
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
            return eachDayOfInterval({
                start: week,
                end: lastDayOfWeek(week, { weekStartsOn: 1 }),
            });
        },
        format(day, args) {
            return format(day, args);
        },
        isWeekend(day) {
            return isWeekend(day);
        },
        isWithinBounds(day) {
            return isWithinInterval(day, {
                start: new Date(document.getElementById('start').value),
                end: new Date(document.getElementById('end').value),
            });
        },
        monthsDivider(day) {
            // TODO: move condition
            const showMonthsDivider = false;

            if (!showMonthsDivider) return;

            let classes = '';
            if (this.isFirstRow(day)) classes += 'border-t-gray-500';
            if (this.isFirst(day)) classes += ' border-l-gray-500';
            return classes;
        },
        isFirstRow(day) {
            return getDate(day) <= 7;
        },
        isFirst(day) {
            return getDate(day) === 1 && getDay(day) !== 1;
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
        mouseenterDay(day) {
            const interval = {
                start: startOfDay(day),
                end: endOfDay(day),
            };

            if (this.mousedown) {
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
            }
        },
        eventsThatDay(day) {
            let events = this.$store.getters['events/onCalendarOnDay'](day);
            if (!events.length) return false;

            events = events.sort((a, b) => a.start - b.start);
            events = events.sort((d) => (d.fullDay ? 0 : 1));
            return events;
        },
    },
};
</script>
