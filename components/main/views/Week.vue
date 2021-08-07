<template>
    <div class="w-full h-full overflow-hidden">
        <div
            class="no-scrollbar relative flex h-full overflow-auto"
            style="scroll-snap-type: x mandatory; scroll-padding: 4rem"
        >
            <div
                class="
                    sticky
                    z-20
                    left-0
                    flex-none
                    w-16
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
                        v-for="hour in hours"
                        :key="hour"
                        class="h-16 text-center text-gray-400 text-xs"
                    >
                        <span class="block -translate-y-2">
                            {{ hour.toString().padStart(2, '0') }}:00
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
                        00:00
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
                        top-8
                        h-20
                        bg-gray-800
                        border-b border-gray-700
                    "
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
                    class="mb-4 mt-12 border-t border-gray-800"
                    :style="tool === 'select' ? 'cursor: cell' : ''"
                >
                    <div
                        v-for="hour in hours"
                        :key="hour"
                        class="
                            h-16
                            text-center text-gray-400 text-xs
                            border-b border-gray-800
                        "
                    >
                        <!-- Events that hour -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {
    eachDayOfInterval,
    eachMonthOfInterval,
    format,
    getDaysInMonth,
    isWeekend,
} from 'date-fns';

export default {
    computed: {
        calendar() {
            return this.$store.getters['calendars/selected'];
        },
        weekdays() {
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
    },
    methods: {
        format(day, args) {
            return format(day, args);
        },
        isWeekend(day) {
            return isWeekend(day);
        },
        daysInMonth(date) {
            return getDaysInMonth(date);
        },
    },
};
</script>
