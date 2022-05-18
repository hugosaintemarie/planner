<template>
    <div class="flex flex-1 h-full overflow-hidden">
        <MainAside />
        <div class="flex flex-col flex-1 h-full p-4 pb-0">
            <MainViewsFullHeader />
            <div
                class="flex flex-col flex-1 w-full mt-3 -mb-px overflow-hidden"
            >
                <MainViewsFullDays />
                <MainViewsFullCalendar />
            </div>
        </div>
    </div>
</template>
