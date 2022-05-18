<template>
    <aside class="flex-none bg-gray-800 border-l border-gray-700 w-60">
        <div class="h-full overflow-auto">
            <MainSidebarCategories />
            <MainSidebarStatistics class="border-t border-gray-700" />
        </div>
    </aside>
</template>

<script>
export default {
    mounted() {
        for (let i = 0; i < 6; i += 1) {
            this.$store.dispatch('categories/add', `Category ${i}`);
        }
    },
};
</script>
