<template>
    <div class="p-4">
        <h1 class="font-semibold">Statistics</h1>

        <div class="mt-4 space-y-4">
            <div
                v-for="category in categories"
                :key="category.id"
                class="flex items-center space-x-3"
            >
                <div
                    class="w-1 h-8 rounded"
                    :style="`background-color: ${category.color}`"
                ></div>
                <span class="text-gray-400">{{
                    category.title || '&nbsp;'
                }}</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        categories() {
            return this.$store.state.categories.list;
        },
    },
};
</script>
