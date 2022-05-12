<template>
    <div class="p-4">
        <h1 class="font-semibold">Statistics</h1>

        <transition-group
            class="mt-4 space-y-4"
            move-class="duration-200"
            tag="div"
        >
            <div
                v-for="category in categories"
                :key="category.id"
                class="flex items-center"
            >
                <div
                    class="w-1 h-8 rounded"
                    :style="`background-color: ${category.color}`"
                ></div>
                <span class="ml-3 text-gray-400">{{
                    category.title || '&nbsp;'
                }}</span>
                <span class="ml-auto text-gray-400">{{
                    count(category) || 0
                }}</span>
            </div>
        </transition-group>
    </div>
</template>

<script>
export default {
    computed: {
        categories() {
            return this.$store.state.categories.list;
        },
    },
    methods: {
        count(category) {
            return this.$store.getters['events/onCalendar']().filter(
                (d) => d.category === category
            ).length;
        },
    },
};
</script>
