<template>
    <div class="flex-1 overflow-hidden">
        <div class="h-full pb-4 overflow-auto no-scrollbar">
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
                        class="relative flex-1 w-0 border-t border-l border-gray-700 h-44"
                        :class="[
                            isWeekend(day)
                                ? isWithinBounds(day)
                                    ? 'bg-gray-800'
                                    : 'bg-gray-800/50'
                                : '',
                            monthsDivider(day),
                        ]"
                        @mousedown="mousedownDay(day)"
                        @mouseenter="mouseenterDay(day)"
                        @dblclick="dblclickDay(day)"
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
                            class="m-2 mb-1.5 text-xs uppercase select-none"
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
                                :class="
                                    tool === 'select'
                                        ? 'pointer-events-none'
                                        : ''
                                "
                                @mousedown.stop="mousedownEvent(event)"
                                @dblclick.stop="dblclickEvent(event)"
                            >
                                <div
                                    v-if="event.fullDay"
                                    class="px-1 py-0.5 select-none h-6"
                                    :class="[
                                        isStart(event, day)
                                            ? 'ml-1 rounded-l'
                                            : '',
                                        isEnd(event, day)
                                            ? 'mr-1 rounded-r'
                                            : '',
                                        tool === 'select'
                                            ? 'pointer-events-none'
                                            : '',
                                    ]"
                                    :style="`background-color: ${event.bgColor()}; margin-left: ${
                                        isStart(event, day) ||
                                        isFirstOfWeek(day)
                                            ? ''
                                            : '-1px'
                                    };`"
                                >
                                    <div :style="`color: ${event.textColor()}`">
                                        <p
                                            v-if="event.category"
                                            class="text-sm"
                                        >
                                            {{
                                                isStart(event, day) ||
                                                isFirstOfWeek(day)
                                                    ? event.title()
                                                    : ''
                                            }}
                                        </p>
                                        <input
                                            v-if="!event.category"
                                            ref="eventTitle"
                                            type="text"
                                            class="w-full bg-transparent border-none outline-none text-inherit"
                                            placeholder="New event"
                                            @blur="confirmEvent(event, $event)"
                                        />
                                    </div>
                                </div>
                                <div v-if="!event.fullDay" class="flex">
                                    <div
                                        class="flex-none mr-2 mt-1.5 w-2 h-2 rounded-full"
                                        :style="`background-color: ${event.color()}`"
                                    ></div>
                                    <p
                                        class="flex flex-1"
                                        :style="`color: ${event.textColor()}`"
                                    >
                                        <span class="font-semibold">
                                            {{ event.title() }}
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
    parseISO,
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
                    start: parseISO(
                        this.$store.getters['settings/get']('start')
                    ),
                    end: parseISO(this.$store.getters['settings/get']('end')),
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
            if (!this.isWithinBounds(day)) return;

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
            if (!this.isWithinBounds(day)) return;

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
            if (!this.isWithinBounds(day)) return;

            if (this.tool === 'select') return;

            const selection = [
                {
                    start: startOfDay(day),
                    end: endOfDay(day),
                },
            ];
            this.$store.dispatch('events/add', { selection, fullDay: true });

            this.$nextTick(() => this.$refs.eventTitle[0].focus());
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
        confirmEvent(event, $event) {
            const title = $event.target.value;
            const categoryID = undefined;

            this.$store.dispatch('events/confirm', {
                event,
                categoryID,
                title,
            });
        },
    },
};
</script>
