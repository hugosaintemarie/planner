<template>
    <div class="w-full h-full overflow-hidden">
        <div
            class="relative flex h-full overflow-auto no-scrollbar snap-x snap-mandatory scroll-p-16"
            @mousedown="mousedown = true"
            @mouseup="mousedown = false"
        >
            <div
                class="sticky left-0 z-20 flex-none w-16 min-h-full bg-gray-800 border-r border-gray-700"
                style="height: max-content"
            >
                <div
                    class="sticky top-0 z-10 h-32 p-2 bg-gray-800 border-b border-gray-700"
                ></div>
                <div class="py-4">
                    <div
                        v-for="(slot, s) in slots"
                        :key="s"
                        class="text-xs text-center text-gray-400"
                        :style="`height: ${height(slot)}px`"
                    >
                        <span class="block -translate-y-2">
                            {{ format(slot.start, 'HH:mm') }}
                        </span>
                    </div>
                    <div
                        class="block h-0 text-xs text-center text-gray-400 -translate-y-2"
                    >
                        {{ format(slots[slots.length - 1].end, 'HH:mm') }}
                    </div>
                </div>
            </div>
            <div
                class="sticky top-0 left-0 z-10 flex h-8 bg-gray-800 border-b border-gray-700"
            >
                <div
                    v-for="month in months"
                    :key="month.valueOf()"
                    class="flex-none border-r border-gray-700 last:border-none"
                    :style="`width: calc(${daysInMonth(month)} * 128px)`"
                >
                    <span
                        class="sticky top-0 px-4 py-2 text-xs font-semibold text-gray-400 left-16"
                    >
                        {{ format(month, 'MMMM yyyy') }}
                    </span>
                </div>
            </div>
            <div
                v-for="day in days"
                :key="day.valueOf()"
                class="relative flex-none w-32 min-h-full border-r border-gray-700 last:border-none snap-start h-max"
                :class="[isWeekend(day) ? 'bg-gray-800/40' : '']"
            >
                <div
                    class="sticky z-10 h-24 -translate-x-px bg-gray-800 border-b border-l border-gray-700 top-8"
                    style="width: calc(100% + 2px)"
                >
                    <div
                        class="p-2 text-xs text-center text-gray-400 border-b border-gray-700"
                    >
                        {{ format(day, 'eee d') }}
                    </div>
                    <div
                        v-if="eventsThatDay(day, 'full')"
                        class="w-full p-px space-y-1 text-sm text-left"
                    >
                        <!-- All day events -->
                        <div class="relative m-px">
                            <div
                                v-for="event in eventsThatDay(day, 'full')"
                                :key="event.id"
                                class="px-1 py-0.5 w-full rounded select-none"
                                :style="`background-color: ${event.category.bgColor};`"
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
                <div
                    class="relative mt-12 mb-4 border-t border-gray-800"
                    :style="tool === 'select' ? 'cursor: cell' : ''"
                >
                    <div
                        v-for="(slot, s) in slots"
                        :key="s"
                        class="relative text-xs text-center text-gray-400 border-b border-gray-800"
                        :style="`height: ${height(slot)}px`"
                        @mousedown="mousedownSlot(day, slot)"
                        @mouseenter="mouseenterSlot(day, slot)"
                    >
                        <div
                            v-if="isSelected(day, slot)"
                            :class="selectionClasses(day, slot)"
                            style="
                                height: calc(100% + 2px);
                                width: calc(100% + 2px);
                            "
                        ></div>
                        <!-- <div
                            v-if="eventsInSlot(day, slot)"
                            class="p-1 space-y-1 text-sm text-left"
                        >
                            <div
                                v-for="event in eventsInSlot(day, slot)"
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
                        </div> -->
                    </div>

                    <div
                        v-if="eventsThatDay(day, 'notFull')"
                        class="absolute top-0 left-0 w-full space-y-1 text-sm text-left"
                    >
                        <div class="relative m-px">
                            <div
                                v-for="event in eventsThatDay(day, 'notFull')"
                                :key="event.id"
                                class="absolute left-0 w-full px-2 py-1 rounded select-none"
                                :style="`background-color: ${
                                    event.category.bgColor
                                }; top: ${top(event)}px; height: calc(${height(
                                    event
                                )}px - 3px)`"
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
    differenceInMinutes,
    eachDayOfInterval,
    eachMonthOfInterval,
    format,
    getDaysInMonth,
    getHours,
    getMinutes,
    isEqual,
    isWeekend,
    parseISO,
    setHours,
    setMinutes,
    subDays,
} from 'date-fns';

export default {
    data() {
        return {
            pxPerMinute: 1.5,
            mousedown: false,
        };
    },
    computed: {
        calendar() {
            return this.$store.getters['calendars/selected'];
        },
        weekdays() {
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        },
        slots() {
            return this.$store.getters['week/slots'];
        },
        months() {
            return eachMonthOfInterval(
                {
                    start: parseISO(
                        this.$store.getters['settings/get']('start')
                    ),
                    end: parseISO(this.$store.getters['settings/get']('end')),
                },
                { weekStartsOn: 1 }
            );
        },
        days() {
            return eachDayOfInterval(
                {
                    start: parseISO(
                        this.$store.getters['settings/get']('start')
                    ),
                    end: parseISO(this.$store.getters['settings/get']('end')),
                },
                { weekStartsOn: 1 }
            );
        },
        hours() {
            return new Array(24).fill(0).map((_, i) => i);
        },
        tool() {
            return this.$store.getters['tools/selected'];
        },
        selected() {
            return this.$store.getters['selection/selected'];
        },
    },
    methods: {
        format(day, args) {
            return format(day, args);
        },
        isWeekend(day) {
            return isWeekend(day);
        },
        duration(interval) {
            return differenceInMinutes(interval.end, interval.start);
        },
        height(slot) {
            return Math.round(this.duration(slot) * this.pxPerMinute);
        },
        differenceFromStart(event) {
            const firstSlot = this.slots[0];
            const start = setHours(
                setMinutes(new Date(event.start), firstSlot.start.getMinutes()),
                firstSlot.start.getHours()
            );
            return differenceInMinutes(event.start, start);
        },
        top(event) {
            return Math.round(
                this.differenceFromStart(event) * this.pxPerMinute
            );
        },
        isSelected(day, slot) {
            const start = setHours(
                setMinutes(new Date(day), slot.start.getMinutes()),
                slot.start.getHours()
            );
            const end = setHours(
                setMinutes(new Date(day), slot.end.getMinutes()),
                slot.end.getHours()
            );

            return this.selected.some(
                (d) => isEqual(d.start, start) && isEqual(d.end, end)
            );
        },
        daysInMonth(date) {
            return getDaysInMonth(date);
        },
        mousedownSlot(day, slot) {
            const interval = {
                start: setHours(
                    setMinutes(new Date(day), slot.start.getMinutes()),
                    slot.start.getHours()
                ),
                end: setHours(
                    setMinutes(new Date(day), slot.end.getMinutes()),
                    slot.end.getHours()
                ),
            };

            if (this.$store.getters['keyboard/isKeydown']('shift')) {
                if (!this.$store.getters['keyboard/isKeydown']('meta'))
                    this.$store.dispatch('selection/unselectAll', interval);
                this.$store.dispatch('selection/selectSlotsRect', {
                    interval,
                    slots: this.slots,
                });
                // } else if (this.$store.getters['keyboard/isKeydown']('alt')) {
                //     this.$store.dispatch('selection/unselectAll', interval);
                //     this.$store.dispatch('selection/selectSlotsRange', interval);
            } else if (this.$store.getters['keyboard/isKeydown']('meta')) {
                if (this.isSelected(day, slot)) {
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
        },
        mouseenterSlot(day, slot) {
            const interval = {
                start: setHours(
                    setMinutes(new Date(day), slot.start.getMinutes()),
                    slot.start.getHours()
                ),
                end: setHours(
                    setMinutes(new Date(day), slot.end.getMinutes()),
                    slot.end.getHours()
                ),
            };

            if (this.mousedown) {
                if (this.$store.getters['keyboard/isKeydown']('meta')) {
                    if (this.unselect)
                        this.$store.dispatch('selection/unselect', interval);
                    else this.$store.dispatch('selection/select', interval);
                    // } else if (this.$store.getters['keyboard/isKeydown']('alt')) {
                    //     this.$store.dispatch('selection/unselectAll');
                    //     this.$store.dispatch(
                    //         'selection/selectSlotsRange',
                    //         interval
                    //     );
                } else {
                    this.$store.dispatch('selection/unselectAll');
                    this.$store.dispatch('selection/selectSlotsRect', {
                        interval,
                        slots: this.slots,
                    });
                }
            }
        },
        selectionClasses(day, slot) {
            let classes =
                'bg-blue-400/10 absolute -left-px -top-px border-blue-400 pointer-events-none';

            const prev = this.slots.find(
                (d) =>
                    getHours(d.end) === getHours(slot.start) &&
                    getMinutes(d.end) === getMinutes(slot.start)
            );

            const next = this.slots.find(
                (d) =>
                    getHours(d.start) === getHours(slot.end) &&
                    getMinutes(d.start) === getMinutes(slot.end)
            );

            if (!prev || !this.isSelected(day, prev)) classes += ' border-t';
            if (!this.isSelected(subDays(day, 1), slot)) classes += ' border-l';
            if (!this.isSelected(addDays(day, 1), slot)) classes += ' border-r';
            if (!next || !this.isSelected(day, next)) classes += ' border-b';

            return classes;
        },
        eventsThatDay(day, type) {
            let events = this.$store.getters['events/onCalendarOnDay'](day);
            if (!events.length) return false;

            if (type === 'notFull') events = events.filter((e) => !e.fullDay);
            else if (type === 'full') events = events.filter((e) => e.fullDay);
            return events;
        },
    },
};
</script>
