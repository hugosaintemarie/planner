<template>
    <div class="p-4">
        <h1 class="font-semibold">Categories</h1>

        <draggable
            v-model="categories"
            v-bind="dragOptions"
            class="mt-4 space-y-2"
            @start="drag = true"
            @end="drag = false"
        >
            <div
                v-for="category in categories"
                :key="category.id"
                class="px-3 py-2 rounded"
                :style="`background-color: ${category.bgColor}`"
            >
                <span
                    class="whitespace-pre font-semibold"
                    :data-id="category.id"
                    :style="`color: ${category.textColor}`"
                    @keyup="rename"
                    >{{ category.title || '&nbsp;' }}</span
                >
            </div>
        </draggable>
    </div>
</template>

<script>
export default {
    computed: {
        categories: {
            get() {
                return this.$store.state.categories.list;
            },
            set(value) {
                this.$store.commit('categories/update', value);
            },
        },
        dragOptions() {
            return {
                animation: 200,
            };
        },
    },
    methods: {
        rename(event) {
            // const title = event.target.innerHTML;
            // const id = parseInt(event.target.dataset.id);
            // this.$store.commit('categories/rename', { id, title });
        },
    },
};
</script>
