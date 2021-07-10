<template>
    <nav>
        <ul class="flex">
            <li
                v-for="(item, title, index) in nav"
                :key="title"
                class="relative p-4 hover:bg-gray-700 cursor-pointer"
                :class="[
                    item.open ? 'bg-gray-700' : '',
                    index === 0 ? 'font-bold' : '',
                ]"
                @click="open(item)"
            >
                {{ title }}

                <div
                    class="
                        absolute
                        left-0
                        top-full
                        font-normal
                        bg-gray-800
                        border border-gray-700
                        rounded-b-md
                        shadow-lg
                    "
                >
                    <ul
                        v-for="(list, l) in item.entries"
                        :key="l"
                        :class="
                            l !== item.entries.length - 1
                                ? 'border-b border-gray-700'
                                : ''
                        "
                    >
                        <li
                            v-for="(entry, e) in list"
                            :key="e"
                            class="
                                relative
                                flex
                                items-center
                                px-4
                                py-2
                                whitespace-nowrap
                                border-gray-700
                            "
                            :class="[
                                entry.disabled
                                    ? 'text-gray-500'
                                    : 'text-white hover:bg-gray-700',
                                e !== item.entries.length - 1
                                    ? ''
                                    : 'rounded-b',
                            ]"
                        >
                            <span class="mr-12">
                                {{ entry.title }}
                            </span>
                            <i
                                v-if="entry.entries"
                                class="
                                    fas
                                    fa-chevron-right
                                    -mr-1
                                    ml-auto
                                    text-xs
                                "
                            ></i>
                            <ul
                                v-if="entry.entries"
                                class="
                                    absolute
                                    left-full
                                    top-0
                                    bg-gray-800
                                    border border-gray-700
                                    rounded-md rounded-tl-none
                                "
                            >
                                <li
                                    v-for="(subentry, j) in entry.entries"
                                    :key="j"
                                    class="
                                        flex
                                        items-center
                                        px-4
                                        py-2
                                        whitespace-nowrap
                                        border-gray-700
                                    "
                                    :class="[
                                        subentry.disabled
                                            ? 'text-gray-500'
                                            : 'text-white hover:bg-gray-700',
                                        j !== entry.entries.length - 1
                                            ? ''
                                            : 'rounded-r',
                                    ]"
                                >
                                    <span class="mr-12">
                                        {{ subentry.title }}
                                    </span>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    data() {
        return {
            nav: {
                Planner: {
                    entries: [
                        [{ title: 'About Planner', disabled: true }],
                        [{ title: 'Preferences', disabled: true }],
                    ],
                },
                File: {
                    entries: [
                        [
                            { title: 'New project', disabled: true },
                            {
                                title: 'Change project',
                                entries: [
                                    {
                                        title: 'No other project',
                                        disabled: true,
                                    },
                                ],
                            },
                            { title: 'Open…' },
                            { title: 'Save as .planner…' },
                        ],
                        [{ title: 'Project settings…', disabled: true }],
                        [{ title: 'Delete project', disabled: true }],
                    ],
                },
                Edit: {
                    entries: [
                        [
                            { title: 'Undo', disabled: true },
                            { title: 'Redo', disabled: true },
                        ],
                        [
                            { title: 'Cut', disabled: true },
                            { title: 'Copy', disabled: true },
                            { title: 'Paste', disabled: true },
                        ],
                        [{ title: 'Select all' }],
                        [{ title: 'Edit all calendars at once' }],
                    ],
                },
                View: {
                    entries: [
                        [
                            { title: 'Week view' },
                            { title: 'Full view' },
                            { title: 'Linear view' },
                        ],
                        [
                            {
                                title: 'Show/hide days',
                                entries: [
                                    { title: 'Monday' },
                                    { title: 'Tuesday' },
                                    { title: 'Wednesday' },
                                    { title: 'Thursday' },
                                    { title: 'Friday' },
                                    { title: 'Saturday' },
                                    { title: 'Sunday' },
                                ],
                            },
                            {
                                title: 'Week starts on',
                                entries: [
                                    { title: 'Monday' },
                                    { title: 'Tuesday' },
                                    { title: 'Wednesday' },
                                    { title: 'Thursday' },
                                    { title: 'Friday' },
                                    { title: 'Saturday' },
                                    { title: 'Sunday' },
                                ],
                            },
                        ],
                    ],
                },
            },
        };
    },
    methods: {
        open: (item) => {
            item.open = !item.open;
            // console.log(item);
        },
    },
};
</script>
