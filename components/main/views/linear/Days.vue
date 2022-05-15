<template>
    <div>
        <div class="relative flex">
            <div
                v-for="month in months"
                :key="toMonthString(month)"
                class="relative flex-none w-40 py-1 pl-4 text-sm text-gray-400"
                :style="`width: ${monthWidth(month)}px`"
            >
                <p class="sticky inline left-4">
                    <strong class="font-bold text-gray-50">{{
                        month.toLocaleString('en-US', {
                            month: 'long',
                        })
                    }}</strong>
                    {{ month.getFullYear() }}
                </p>
            </div>
        </div>
        <div class="relative flex pb-2 border-b border-gray-700 w-fit">
            <div
                v-for="day in daysShown"
                :key="toDayString(day)"
                class="relative flex-none w-40 py-1 pl-4 text-xs text-center text-gray-400"
                :style="`width: ${dayWidth}px`"
            >
                <span>{{ toDayString(day) }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import {
    eachDayOfInterval,
    eachMonthOfInterval,
    lastDayOfMonth,
    parseISO,
    min,
    max,
} from 'date-fns';

export default {
    data() {
        return {
            dayWidth: 160,
        };
    },
    computed: {
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
    },
    methods: {
        toDayString(day) {
            const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return `${weekdays[day.getDay()]} ${day.getDate()}`;
        },
        toMonthString(month) {
            return `${month.toLocaleString('en-US', {
                month: 'long',
            })} ${month.getFullYear()}`;
        },
        monthWidth(month) {
            const start = max([
                month,
                parseISO(this.$store.getters['settings/get']('start')),
            ]);
            const end = min([
                lastDayOfMonth(month),
                parseISO(this.$store.getters['settings/get']('end')),
            ]);

            console.log(start, end);
            const days = eachDayOfInterval(
                {
                    start,
                    end,
                },
                { weekStartsOn: 1 }
            );
            const shown = this.$store.getters['views/days'];
            const count = days.filter(
                (day) => shown[day.getDay()].checked
            ).length;
            return count * this.dayWidth;
            // return 1000;
        },
    },
};
</script>
