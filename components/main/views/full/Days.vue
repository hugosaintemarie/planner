<template>
    <div
        class="relative flex w-full pb-4 after:absolute after:z-10 after:left-0 after:top-full after:w-full after:h-px after:bg-gray-700"
    >
        <div
            v-for="weekday in weekdays"
            :key="weekday"
            class="flex-1 py-1 pl-4 text-xs text-center text-gray-400 transition duration-75 cursor-pointer group hover:text-white"
        >
            <span>{{ weekday }}</span>
            <i
                class="ml-1 align-baseline transition duration-75 opacity-0 fas fa-chevron-down group-hover:opacity-100"
                style="font-size: 10px"
            ></i>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        weekdays() {
            return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        },
    },
};
</script>
