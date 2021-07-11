<template>
    <div class="flex ml-8 text-lg">
        <div
            v-for="(tool, name) in tools"
            :key="name"
            class="flex items-center justify-center w-14 h-full cursor-pointer"
            :class="
                tool.selected
                    ? 'text-white bg-gray-700'
                    : 'text-gray-500 hover:text-gray-400'
            "
            @click="select(tool)"
        >
            <i :class="tool.icon"></i>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            tools: {
                select: {
                    icon: 'fas fa-plus',
                    selected: true,
                },
                draw: {
                    icon: 'fas fa-mouse-pointer',
                    selected: false,
                },
            },
            select: (tool) => {
                Object.values(this.tools).forEach((d) => (d.selected = false));
                tool.selected = true;
            },
        };
    },
};
</script>
