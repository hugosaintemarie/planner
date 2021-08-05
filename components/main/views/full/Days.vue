<template>
    <div
        class="
            after:absolute
            relative
            after:z-10 after:left-0 after:top-full
            flex
            pb-4
            w-full
            after:w-full after:h-px after:bg-gray-700
        "
    >
        <div
            v-for="weekday in weekdays"
            :key="weekday"
            class="
                group
                flex-1
                pl-4
                py-1
                text-center text-gray-400
                hover:text-white
                text-xs
                cursor-pointer
                transition
                duration-75
            "
        >
            <span>{{ weekday }}</span>
            <i
                class="
                    fas
                    fa-chevron-down
                    align-baseline
                    ml-1
                    opacity-0
                    group-hover:opacity-100
                    transition
                    duration-75
                "
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
