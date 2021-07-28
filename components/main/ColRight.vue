<template>
    <div class="bg-gray-800 border-l border-gray-700">
        <div class="h-full overflow-auto">
            <MainViewsColRightCategories />
            <MainViewsColRightStatistics />
        </div>
    </div>
</template>

<script>
export default {
    mounted() {
        for (let i = 0; i < 6; i += 1) {
            this.add();
        }
    },
    methods: {
        add() {
            this.$store.dispatch('categories/add');
        },
    },
};
</script>
