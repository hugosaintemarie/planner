<template>
    <div class="p-4 pb-2 pr-2">
        <h1 class="font-semibold">Categories</h1>

        <Container
            class="mt-3"
            lock-axis="y"
            behaviour="contain"
            drag-handle-selector=".handle"
            @drop="onDrop"
        >
            <Draggable v-for="category in categories" :key="category.id">
                <div class="flex items-center gap-2 py-1 group">
                    <div
                        class="flex-1 px-3 py-2 rounded"
                        :style="`background-color: ${category.bgColor}`"
                        @click="onClick(category)"
                    >
                        <span
                            class="font-semibold whitespace-pre"
                            :data-id="category.id"
                            :style="`color: ${category.textColor}`"
                            @keyup="rename"
                            >{{ category.title || '&nbsp;' }}</span
                        >
                    </div>
                    <div
                        class="relative p-1 rounded opacity-0 handle cursor-grab group-active:cursor-grabbing group-hover:opacity-100"
                        :style="`color: ${category.textColor}`"
                        data-tooltip="<p class='text-xs leading-normal text-gray-400'><strong class='text-gray-200'>Click</strong> to open menu<br><strong class='text-gray-200'>Drag</strong> to reorder</p>"
                        data-tooltip-side="left"
                        @mouseenter="$nuxt.$emit('show-tooltip', $event)"
                        @mouseleave="$nuxt.$emit('hide-tooltip', $event)"
                    >
                        <div
                            class="absolute inset-0 rounded opacity-0 hover:opacity-50"
                            :style="`background-color: ${category.bgColor}`"
                        ></div>
                        <span class="relative pointer-events-none">⋮⋮</span>
                    </div>
                </div>
            </Draggable>
        </Container>

        <div
            class="flex items-center gap-2 py-2 mt-2 text-gray-400 cursor-pointer hover:text-white"
            @click="addCategory"
        >
            <i class="fas fa-plus fa-xs"></i>
            Add new category
        </div>
    </div>
</template>

<script>
// eslint-disable-next-line import/no-absolute-path
import { applyDrag } from '/plugins/draggable-utils';

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
    },
    methods: {
        onDrop(dropResult) {
            this.categories = applyDrag(this.categories, dropResult);
        },
        onClick(category) {
            this.$store.dispatch('events/add', {
                category,
                fullDay: this.$store.getters['views/current'] === 'full',
            });
        },
        rename(event) {
            // const title = event.target.innerHTML;
            // const id = parseInt(event.target.dataset.id);
            // this.$store.commit('categories/rename', { id, title });
        },
        addCategory() {
            this.$store.dispatch('categories/add');
        },
    },
};
</script>
