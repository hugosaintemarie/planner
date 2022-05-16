<template>
    <div class="relative w-full h-full">
        <MainAsideHeader
            class="absolute top-0 left-0 z-20 flex-none bg-gray-800 border-r border-gray-700 w-60"
        />
        <div
            class="flex flex-col flex-1 h-full overflow-auto scroll-pl-60 scroll-pt-[69px] snap-both no-scrollbar pl-60"
        >
            <MainViewsLinearDays />
            <MainViewsLinearCalendars />
        </div>
    </div>
</template>
