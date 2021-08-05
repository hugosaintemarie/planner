<template>
    <div></div>
</template>

<script>
export default {
    mounted() {
        document.addEventListener('keydown', this.onKeydown);
        document.addEventListener('keyup', this.onKeyup);
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKeydown);
        document.removeEventListener('keyup', this.onKeyup);
    },
    methods: {
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

            if (which === 83) this.$store.dispatch('tools/select', 'select');
            if (which === 68) this.$store.dispatch('tools/select', 'draw');

            if (which === 70) this.$store.dispatch('views/select', 'full');
            if (which === 76) this.$store.dispatch('views/select', 'linear');
            if (which === 87) this.$store.dispatch('views/select', 'week');

            if (ctrlOrMeta && which === 83) this.save(e); // Cmd + S
        },
        onKeyup(e) {
            const which = e.which;

            if (e.target.readOnly === false) {
                if (which === 13) e.target.blur();
                return;
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
