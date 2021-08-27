<template>
    <div></div>
</template>

<script>
export default {
    data() {
        return {
            isMousedown: false,
        };
    },
    mounted() {
        document.addEventListener('mousedown', this.onMousedown);
        document.addEventListener('mouseup', this.onMouseup);
        document.addEventListener('keydown', this.onKeydown);
        document.addEventListener('keyup', this.onKeyup);
    },
    beforeDestroy() {
        document.removeEventListener('mousedown', this.onMousedown);
        document.removeEventListener('mouseup', this.onMouseup);
        document.removeEventListener('keydown', this.onKeydown);
        document.removeEventListener('keyup', this.onKeyup);
    },
    methods: {
        onMousedown() {
            this.isMousedown = true;
        },
        onMouseup() {
            this.isMousedown = false;
        },
        onKeydown(e) {
            const which = e.which;

            if (e.target.readOnly === false) {
                if (which === 13) e.target.blur();
                return;
            }

            this.$store.dispatch('keyboard/keydown', which);

            const ctrlOrMeta = e.metaKey || e.ctrlKey;

            // console.log(which);

            // Arrow keys
            if ([37, 38, 39, 40].includes(which)) {
                // Prevent scroll
                e.preventDefault();

                // if (panel.isOpen) return;

                if (ctrlOrMeta && [38, 40].includes(which)) {
                    // if (e.which === 38) calendars.selectPrevious(); // Cmd + up
                    // if (e.which === 40) calendars.selectNext(); // Cmd + down
                } else {
                    // Cmd + right/left
                    this.$store.dispatch('selection/update', e);
                }
            }

            if (which === 8) this.$store.dispatch('selection/empty'); // Backspace

            // Alt + mousedown
            if (which === 18 && this.isMousedown) {
                this.$store.dispatch('selection/unselectAll');
                this.$store.dispatch('selection/selectDaysRange');
            }

            if (which === 83) this.$store.dispatch('tools/select', 'select'); // S
            if (which === 68) this.$store.dispatch('tools/select', 'draw'); // D

            if (which === 70) this.$store.dispatch('views/select', 'full'); // F
            if (which === 76) this.$store.dispatch('views/select', 'linear'); // L
            if (which === 87) this.$store.dispatch('views/select', 'week'); // W

            if (ctrlOrMeta && which === 83) this.save(e); // Cmd + S
        },
        onKeyup(e) {
            const which = e.which;

            if (e.target.readOnly === false) {
                if (which === 13) e.target.blur();
                return;
            }

            // Alt + mousedown
            if (which === 18 && this.isMousedown) {
                this.$store.dispatch('selection/unselectAll');
                this.$store.dispatch('selection/selectDaysRect');
            }

            this.$store.dispatch('keyboard/keyup', which);
        },
        save(event) {
            event.preventDefault();
            console.log('save');
        },
    },
};
</script>
