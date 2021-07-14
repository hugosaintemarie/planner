<template>
    <div class="flex items-center px-4">
        <input
            id="start"
            type="date"
            name="start"
            class="px-2 py-1 text-gray-500 bg-gray-900 rounded-sm"
        />
        <i class="fas fa-arrow-right mx-2 text-gray-600 text-sm"></i>
        <input
            id="end"
            type="date"
            name="end"
            class="px-2 py-1 text-gray-500 bg-gray-900 rounded-sm"
        />
    </div>
</template>

<style lang="scss" scoped>
input {
    &::-webkit-calendar-picker-indicator {
        opacity: 0;
    }
}
</style>
