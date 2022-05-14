<template>
    <div
        class="relative flex w-full pb-4 after:absolute after:z-10 after:left-0 after:top-full after:w-full after:h-px after:bg-gray-700"
    >
        <div
            v-for="weekday in weekdaysShown"
            :key="weekday.title"
            v-click-outside="
                () => {
                    close(weekday);
                }
            "
            class="relative flex-1 py-1 pl-4 text-xs text-center text-gray-400 transition duration-75 cursor-pointer group hover:text-white"
            :class="weekday.open ? '!text-white' : ''"
            @click="onclick(weekday)"
        >
            <span>{{ weekday.title }}</span>
            <i
                class="ml-1 align-baseline transition duration-75 opacity-0 fas fa-chevron-down group-hover:opacity-100"
                style="font-size: 10px"
            ></i>
            <transition
                enter-active-class="duration-100 ease-out"
                enter-class="scale-90 opacity-0"
                enter-to-class="opacity-100"
                leave-active-class="duration-100 ease-in"
                leave-class="opacity-100"
                leave-to-class="scale-90 opacity-0"
            >
                <div
                    v-show="weekday.open"
                    class="absolute z-50 p-1 mt-1 text-gray-400 origin-top -translate-x-1/2 bg-gray-800 border border-gray-700 rounded-md shadow top-full left-1/2"
                    @click="hide(weekday)"
                >
                    <ul>
                        <li
                            class="flex items-center gap-2 p-2 rounded hover:text-white whitespace-nowrap hover:bg-gray-700"
                        >
                            <i class="fas fa-eye-slash"></i>
                            Hide column
                        </li>
                    </ul>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import vClickOutside from 'v-click-outside';

export default {
    directives: {
        clickOutside: vClickOutside.directive,
    },
    data() {
        return {
            weekdays: [
                { title: 'Mon', open: false },
                { title: 'Tue', open: false },
                { title: 'Wed', open: false },
                { title: 'Thu', open: false },
                { title: 'Fri', open: false },
                { title: 'Sat', open: false },
                { title: 'Sun', open: false },
            ],
        };
    },
    computed: {
        weekdaysShown() {
            const shown = this.$store.getters['views/days'];
            return this.weekdays.filter((_d, i) => shown[i].checked);
        },
    },
    methods: {
        onclick(weekday) {
            weekday.open = !weekday.open;
        },
        close(weekday) {
            weekday.open = false;
        },
        hide(weekday) {
            this.$store.dispatch(
                'views/hideDay',
                this.weekdays.indexOf(weekday)
            );
        },
    },
};
</script>
