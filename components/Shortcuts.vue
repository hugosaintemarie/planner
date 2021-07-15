<template>
    <div></div>
</template>

<script>
export default {
    mounted() {
        document.addEventListener('keydown', this.onKeydown);
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.onKeydown);
    },
    methods: {
        onKeydown(e) {
            const which = e.which;

            if (e.target.readOnly === false) {
                if (which === 13) e.target.blur();
                return;
            }

            const ctrlOrMeta = e.metaKey || e.ctrlKey;

            console.log(which);

            if (which === 70) this.$store.dispatch('views/select', 'full');
            if (which === 76) this.$store.dispatch('views/select', 'linear');
            if (which === 87) this.$store.dispatch('views/select', 'week');

            if (ctrlOrMeta && which === 83) this.save(e); // Cmd + S
        },
        save(event) {
            event.preventDefault();
            console.log('save');
        },
    },
};
</script>
