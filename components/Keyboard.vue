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
