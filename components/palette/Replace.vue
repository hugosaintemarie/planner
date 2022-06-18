<template>
    <div>
        <div
            class="flex flex-col w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl h-44"
            @click.stop
            @keyup="onKeyup"
        >
            <input
                ref="search"
                v-model="search"
                type="text"
                placeholder="Replace events…"
                class="flex-none w-full p-2 bg-transparent border-b border-gray-700 outline-none"
            />
            <div class="flex-1 p-2 overflow-auto">
                <!-- <div
                    v-for="(category, i) in filteredCategories"
                    :key="category.title"
                    class="flex items-stretch gap-2 py-1 pl-2 pr-4 text-gray-400 rounded cursor-pointer"
                    :class="i === hovered ? 'text-gray-200 bg-gray-700' : ''"
                    @mouseenter="hovered = i"
                    @mouseleave="hovered = null"
                    @click="onClick()"
                >
                    <div
                        class="w-1 rounded-full"
                        :style="`background-color: ${category.color}`"
                    ></div>
                    <p class="py-1">
                        {{ category.title }}
                    </p>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            search: '',
            hovered: 0,
        };
    },
    computed: {
        filteredCategories() {
            return this.$store.getters['categories/all']
                .filter((item) =>
                    item.title.toLowerCase().includes(this.search.toLowerCase())
                )
                .sort((a, b) => (a.title > b.title ? 1 : -1))
                .sort((a, b) =>
                    a.title.length > b.title.length
                        ? 1
                        : a.title.length < b.title.length
                        ? -1
                        : 0
                );
        },
    },
    mounted() {
        this.focus();
        addEventListener('keydown', this.onKeydown);
    },
    destroyed() {
        removeEventListener('keydown', this.onKeydown);
    },
    methods: {
        onKeydown(event) {
            event.stopPropagation();

            if (event.key === 'Enter') {
                this.onClick();
            } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault();

                const shown = this.filteredCategories.length;

                if (event.key === 'ArrowDown')
                    this.hovered = (this.hovered + 1) % shown;
                else if (event.key === 'ArrowUp')
                    this.hovered = (this.hovered - 1 + shown) % shown;
            } else if (String.fromCharCode(event.keyCode).match(/\w|\s/g)) {
                this.hovered = 0;
            }
        },
        onKeyup(event) {
            event.stopPropagation();
        },
        onClick(close = true) {
            const category = this.filteredCategories[this.hovered];
            this.$store.dispatch('events/add', {
                category,
                fullDay: this.$store.getters['views/current'] === 'full',
            });
            if (close) this.$emit('close');
            else this.focus();
        },
        focus() {
            this.$nextTick(() => this.$refs.search.focus());
        },
    },
};
</script>
