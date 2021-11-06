<template>
    <div class="w-full h-full overflow-hidden">
        <div
            class="no-scrollbar relative flex h-full overflow-auto"
            style="scroll-snap-type: x mandatory; scroll-padding: 4rem"
            @mousedown="mousedown = true"
            @mouseup="mousedown = false"
        >
            <div
                class="
                    sticky
                    z-20
                    left-0
                    flex-none
                    w-16
                    min-h-full
                    bg-gray-800
                    border-r border-gray-700
                "
                style="height: max-content"
            >
                <div
                    class="
                        sticky
                        z-10
                        top-0
                        p-2
                        h-28
                        bg-gray-800
                        border-b border-gray-700
                    "
                ></div>
                <div class="py-4">
                    <div
                        v-for="(slot, s) in slots"
                        :key="s"
                        class="text-center text-gray-400 text-xs"
                        :style="`height: ${height(slot)}px`"
                    >
                        <span class="block -translate-y-2">
                            {{ format(slot.start, 'HH:mm') }}
                        </span>
                    </div>
                    <div
                        class="
                            block
                            h-0
                            text-center text-gray-400 text-xs
                            -translate-y-2
                        "
                    >
                        {{ format(slots[slots.length - 1].end, 'HH:mm') }}
                    </div>
                </div>
            </div>
            <div
                class="
                    sticky
                    z-10
                    left-0
                    top-0
                    flex
                    h-8
                    bg-gray-800
                    border-b border-gray-700
                "
            >
                <div
                    v-for="month in months"
                    :key="month.valueOf()"
                    class="flex-none border-r last:border-none border-gray-700"
                    :style="`width: calc(${daysInMonth(month)} * 128px)`"
                >
                    <span
                        class="
                            sticky
                            left-16
                            top-0
                            px-4
                            py-2
                            text-gray-400 text-xs
                            font-semibold
                        "
                    >
                        {{ format(month, 'MMMM yyyy') }}
                    </span>
                </div>
            </div>
            <div
                v-for="day in days"
                :key="day.valueOf()"
                class="
                    relative
                    flex-none
                    w-32
                    min-h-full
                    border-r
                    last:border-none
                    border-gray-700
                "
                style="scroll-snap-align: start; height: max-content"
                :class="[isWeekend(day) ? 'bg-gray-800/40' : '']"
            >
                <div
                    class="
                        sticky
                        z-10
                        top-8
                        h-20
                        bg-gray-800
                        border-b border-l border-gray-700
                        -translate-x-px
                    "
                    style="width: calc(100% + 2px)"
                >
                    <div
                        class="
                            p-2
                            text-center text-gray-400 text-xs
                            border-b border-gray-700
                        "
                    >
                        {{ format(day, 'eee d') }}
                    </div>
                    <div class="p-2">
                        <!-- All day events -->
                    </div>
                </div>
                <div
                    class="relative mb-4 mt-12 border-t border-gray-800"
                    :style="tool === 'select' ? 'cursor: cell' : ''"
                >
                    <div
                        v-for="(slot, s) in slots"
                        :key="s"
                        class="
                            relative
                            text-center text-gray-400 text-xs
                            border-b border-gray-800
                        "
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
                            class="p-1 text-left text-sm space-y-1"
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
                        v-if="eventsThatDay(day)"
                        class="
                            absolute
                            left-0
                            top-0
                            w-full
                            text-left text-sm
                            space-y-1
                        "
                    >
                        <div class="relative m-px">
                            <div
                                v-for="event in eventsThatDay(day)"
                                :key="event.id"
                                class="
                                    absolute
                                    left-0
                                    px-2
                                    py-1
                                    w-full
                                    rounded
                                    select-none
                                "
                                :style="`background-color: ${
                                    event.category.bgColor
                                }; top: ${top(event)}px;
                            height: calc(${height(event)}px - 3px)`"
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
                    start: new Date(document.getElementById('start').value),
                    end: new Date(document.getElementById('end').value),
                },
                { weekStartsOn: 1 }
            );
        },
        days() {
            return eachDayOfInterval(
                {
                    start: new Date(document.getElementById('start').value),
                    end: new Date(document.getElementById('end').value),
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
        eventsThatDay(day) {
            const events = this.$store.getters['events/onCalendarOnDay'](day);
            if (events.length) return events;
            else return false;
        },
    },
};
</script>
