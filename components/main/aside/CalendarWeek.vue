<template>
    <div
        class="flex flex-col items-center m-4 rounded-md cursor-pointer"
        :class="selected === calendar.id ? 'text-white' : ' text-gray-400'"
    >
        <div
            class="w-full mb-3 overflow-hidden bg-gray-800 border-2 rounded-lg"
            :class="
                selected === calendar.id ? 'border-gray-100' : 'border-gray-700'
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
                    :class="d === 0 ? '' : 'border-l border-gray-700'"
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
                            v-for="event in eventsThatDay(day, calendar)"
                            :key="event.id"
                            class="flex-none m-px w-1.5 h-1.5 rounded-full"
                            :style="`background-color: ${event.category.color}`"
                        ></div>
                    </div>
                </div>
            </div>
        </div>

        <span class="whitespace-pre">{{ calendar.title || '&nbsp;' }}</span>
    </div>
</template>

<script>
export default {
    props: {
        calendar: {
            type: Object,
            required: true,
        },
        selected: {
            type: Number,
            required: true,
        },
        days: {
            type: Function,
            required: true,
        },
        weeks: {
            type: Array,
            required: true,
        },
        isSelected: {
            type: Function,
            required: true,
        },
        selectionClasses: {
            type: Function,
            required: true,
        },
        eventsThatDay: {
            type: Function,
            required: true,
        },
    },
};
</script>
