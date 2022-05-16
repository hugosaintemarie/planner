<template>
    <aside
        class="sticky left-0 flex-none overflow-hidden bg-gray-800 border-r border-gray-700 w-60"
    >
        <Container
            class="h-full pb-6 overflow-auto no-scrollbar"
            lock-axis="y"
            behaviour="contain"
            @drop="onDrop"
        >
            <Draggable v-for="calendar in calendars" :key="calendar.id">
                <div
                    class="flex items-center justify-center border-b border-gray-700 h-44"
                >
                    <p>{{ calendar.title || '&nbsp;' }}</p>
                </div>
            </Draggable>
        </Container>
    </aside>
</template>

<script>
// eslint-disable-next-line import/no-absolute-path
import { applyDrag } from '/plugins/draggable-utils';

export default {
    computed: {
        calendars: {
            get() {
                return this.$store.state.calendars.list;
            },
            set(value) {
                this.$store.commit('calendars/update', value);
            },
        },
        selected() {
            return this.$store.state.calendars.selected;
        },
    },
    methods: {
        onDrop(dropResult) {
            this.calendars = applyDrag(this.calendars, dropResult);
        },
    },
};
</script>
