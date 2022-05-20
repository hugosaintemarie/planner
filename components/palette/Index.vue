<template>
    <div
        class="absolute inset-0 z-40 flex items-center justify-center"
        :class="isOpen ? '' : 'pointer-events-none'"
        @click="isOpen = false"
    >
        <div
            v-show="isOpen"
            class="w-64 h-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
            @click.stop
            @keyup="onKeyup"
        >
            <input
                ref="search"
                v-model="search"
                type="text"
                placeholder="Search for commands…"
                class="w-full p-2 bg-transparent border-b border-gray-700 outline-none"
            />
            <div class="p-2">
                <div
                    v-for="(command, i) in filteredCommands"
                    :key="command.title"
                    class="flex items-center gap-2 p-2 text-gray-400 rounded cursor-pointer"
                    :class="i === hovered ? 'text-gray-200 bg-gray-700' : ''"
                    @mouseenter="hovered = i"
                    @click="onClick(command)"
                >
                    <i
                        :class="command.icon"
                        class="flex items-center justify-center w-4 h-4"
                    ></i>
                    <span>{{ command.title }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isOpen: false,
            search: '',
            hovered: 0,
        };
    },
    computed: {
        selectionCount() {
            return this.$store.getters['selection/count'];
        },
        commands() {
            return [
                {
                    title: `Add ${this.selectionCount} event${
                        this.selectionCount > 1 ? 's' : ''
                    }`,
                    icon: 'fas fa-plus',
                },
                {
                    title: 'Replace events',
                    icon: 'fas fa-exchange-alt',
                    condition: this.selectionCount > 0,
                },
                {
                    title: 'Delete events',
                    icon: 'far fa-trash-alt',
                    condition: this.selectionCount > 0,
                },
            ];
        },
        filteredCommands() {
            return this.commands
                .filter((command) =>
                    this.search
                        ? command.title
                              .toLowerCase()
                              .startsWith(this.search.toLowerCase())
                        : true
                )
                .filter((command) =>
                    command.condition !== undefined ? command.condition : true
                );
        },
    },
    mounted() {
        addEventListener('keydown', this.onKeydown);
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) this.$nextTick(() => this.$refs.search.focus());
        },
        close() {
            this.isOpen = false;
            this.search = '';
            this.hovered = 0;
        },
        onKeydown(event) {
            event.stopPropagation();

            if (event.key === 'Enter') {
                if (!this.isOpen) this.toggle();
                else this.onClick(this.filteredCommands[this.hovered]);
            } else if (event.key === 'Escape') {
                this.close();
            } else if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                const shown = this.filteredCommands.length;

                if (event.key === 'ArrowDown')
                    this.hovered = (this.hovered + 1) % shown;
                else if (event.key === 'ArrowUp')
                    this.hovered = (this.hovered - 1 + shown) % shown;
            } else {
                this.hovered = 0;
            }
        },
        onKeyup(event) {
            event.stopPropagation();
        },
        onClick(command) {
            console.log(command);
            this.close();
        },
    },
};
</script>
