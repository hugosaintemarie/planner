<template>
    <div class="flex-1 overflow-hidden">
        <div class="no-scrollbar pb-4 h-full overflow-auto">
            <div
                class="border-b border-r border-gray-700"
                :style="tool === 'select' ? 'cursor: cell' : ''"
                @mousedown="mousedown = true"
                @mouseup="mousedown = false"
            >
                <div
                    v-for="(week, w) in weeks"
                    :key="w"
                    class="flex border-t border-gray-700"
                >
                    <div
                        v-for="(day, d) in days(week)"
                        :key="d"
                        class="
                            relative
                            flex-1
                            p-2
                            h-24
                            border-l border-gray-700
                        "
                        :class="
                            isWeekend(day)
                                ? isWithinBounds(day)
                                    ? 'bg-gray-800'
                                    : 'bg-gray-800/50'
                                : ''
                        "
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
                        <div v-if="eventsThatDay(day)" class="mt-1">
                            <div
                                v-for="event in eventsThatDay(day)"
                                :key="event.id"
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
    format,
    isWeekend,
    isWithinInterval,
    lastDayOfWeek,
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
        isSelected(day) {
            return this.selected.some((d) => d.toString() === day.toString());
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
            if (this.$store.getters['keyboard/isKeydown']('shift')) {
                if (!this.$store.getters['keyboard/isKeydown']('meta'))
                    this.$store.dispatch('selection/unselectAll', day);
                this.$store.dispatch('selection/selectRect', day);
            } else if (this.$store.getters['keyboard/isKeydown']('alt')) {
                this.$store.dispatch('selection/unselectAll', day);
                this.$store.dispatch('selection/selectRange', day);
            } else if (this.$store.getters['keyboard/isKeydown']('meta')) {
                if (this.isSelected(day)) {
                    this.unselect = true;
                    this.$store.dispatch('selection/unselect', day);
                } else {
                    this.unselect = false;
                    this.$store.dispatch('selection/select', day);
                    this.$store.dispatch('selection/anchor', day);
                }
            } else {
                this.$store.dispatch('selection/unselectAll');
                this.$store.dispatch('selection/select', day);
                this.$store.dispatch('selection/anchor', day);
                this.$store.dispatch('selection/target', day);
            }

            this.mouseenterDay(day);
        },
        mouseenterDay(day) {
            if (this.mousedown) {
                if (this.$store.getters['keyboard/isKeydown']('meta')) {
                    if (this.unselect)
                        this.$store.dispatch('selection/unselect', day);
                    else this.$store.dispatch('selection/select', day);
                } else if (this.$store.getters['keyboard/isKeydown']('alt')) {
                    this.$store.dispatch('selection/unselectAll');
                    this.$store.dispatch('selection/selectRange', day);
                } else {
                    this.$store.dispatch('selection/unselectAll');
                    this.$store.dispatch('selection/selectRect', day);
                }
            }
        },
        eventsThatDay(day) {
            const events = this.$store.getters['events/onCalendarOnDay'](day);
            if (events.length) return events;
            else return false;
        },
    },
};
</script>
