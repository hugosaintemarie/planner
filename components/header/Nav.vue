<template>
    <nav>
        <ul class="flex">
            <li
                v-for="(item, title, index) in nav"
                :key="title"
                class="
                    relative
                    p-4
                    hover:bg-gray-700
                    cursor-pointer
                    select-none
                "
                :class="[
                    item.open ? 'bg-gray-700' : '',
                    index === 0 ? 'font-bold' : '',
                ]"
                @click="open(item)"
                @mouseenter="enter(item)"
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
                    :class="item.open ? 'block' : 'hidden'"
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
                            ]"
                            @mouseenter="
                                entry.entries ? (entry.open = true) : null
                            "
                            @mouseleave="
                                entry.entries ? (entry.open = false) : null
                            "
                        >
                            <i
                                v-if="entry.checked"
                                class="fas fa-check absolute left-2"
                            ></i>
                            <span class="ml-4 mr-12">
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
                                :class="entry.open ? 'block' : 'hidden'"
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
                                        j === entry.entries.length - 1
                                            ? 'rounded-b'
                                            : '',
                                        j === 0 ? 'rounded-tr' : '',
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
                    open: false,
                    entries: [
                        [{ title: 'About Planner', disabled: true }],
                        [{ title: 'Preferences', disabled: true }],
                    ],
                },
                File: {
                    open: false,
                    entries: [
                        [
                            { title: 'New project', disabled: true },
                            {
                                title: 'Change project',
                                open: false,
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
                    open: false,
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
                    open: false,
                    entries: [
                        [
                            {
                                title: 'Week view',
                                checked:
                                    this.$store.state.views.selected === 'week',
                            },
                            {
                                title: 'Full view',
                                checked:
                                    this.$store.state.views.selected === 'full',
                            },
                            {
                                title: 'Linear view',
                                checked:
                                    this.$store.state.views.selected ===
                                    'linear',
                            },
                        ],
                        [
                            {
                                title: 'Show/hide days',
                                open: false,
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
                                open: false,
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
        open(item) {
            item.open = !item.open;
        },
        enter(item) {
            if (!Object.values(this.nav).some((d) => d.open)) return;

            Object.values(this.nav).forEach((d) => (d.open = false));
            item.open = true;
        },
    },
};
</script>

<style lang="scss" scoped>
nav {
    > ul {
        > li {
            > div {
                > ul:last-child {
                    > li:last-child {
                        @apply rounded-b;
                    }
                }
            }
        }
    }
}
</style>
