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
            const ctrlOrMeta = e.metaKey || e.ctrlKey;
            const which = e.which;

            console.log(which);

            if (ctrlOrMeta && which === 83) this.save(e); // Cmd + S
        },
        save(event) {
            event.preventDefault();
            console.log('save');
        },
    },
};
</script>
