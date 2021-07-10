<template>
    <div class="flex ml-auto text-lg">
        <div
            v-for="(view, name) in views"
            :key="name"
            class="flex items-center justify-center w-14 h-full cursor-pointer"
            :class="
                view.selected
                    ? 'text-white bg-gray-700'
                    : 'text-gray-500 hover:text-gray-400'
            "
            @click="select(view)"
        >
            <i :class="view.icon"></i>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            views: {
                week: {
                    icon: 'fas fa-th-large',
                    selected: true,
                },
                full: {
                    icon: 'fas fa-th',
                },
                linear: {
                    icon: 'fas fa-th-list',
                },
            },
            select: (view) => {
                Object.values(this.views).forEach((d) => (d.selected = false));
                view.selected = true;
            },
        };
    },
};
</script>
