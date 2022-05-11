<template>
    <transition-group
        class="absolute z-40 w-full space-y-2 text-center pointer-events-none bottom-4"
        enter-active-class="duration-200"
        leave-active-class="absolute duration-200 -z-10"
        enter-class="translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-4 opacity-0"
        move-class="duration-200"
    >
        <div
            v-for="toast in toasts"
            :key="toast.index"
            class="flex justify-center w-full"
        >
            <div
                class="px-2 py-1.5 text-white bg-black rounded pointer-events-auto w-fit"
            >
                {{ toast.msg }}
                <span
                    v-if="toast.undo"
                    class="ml-4 tracking-wide text-gray-500 uppercase cursor-pointer hover:text-white"
                    @click="undo(toast.index)"
                >
                    Undo
                </span>
            </div>
        </div>
    </transition-group>
</template>

<script>
export default {
    computed: {
        toasts() {
            console.log(this.$store.getters['toasts/visible']);
            return this.$store.getters['toasts/visible'];
        },
    },
    methods: {
        undo(index) {
            this.$store.dispatch('toasts/undo', index);
        },
    },
};
</script>
