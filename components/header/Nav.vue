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
            <!-- <li>
                <strong>Planner</strong>
                <ul>
                    <li class="disabled">About Planner</li>
                    <li class="disabled border-top">Preferences</li>
                </ul>
            </li>
            <li>
                File
                <ul>
                    <li class="disabled">New project…</li>
                    <li class="sub">
                        Change project
                        <ul>
                            <li class="disabled">No other project</li>
                        </ul>
                    </li>
                    <li data-tool="open">Open…</li>
                    <li data-tool="save">Save as .planner</li>
                    <li class="border-top disabled">Project settings…</li>
                    <li class="border-top disabled">Delete project</li>
                </ul>
            </li>
            <li>
                Edit
                <ul>
                    <li class="disabled" data-tool="undo" data-shortcut="⌘Z">
                        Undo
                    </li>
                    <li class="disabled" data-tool="redo" data-shortcut="⇧⌘Z">
                        Redo
                    </li>
                    <li
                        class="disabled border-top"
                        data-tool="cut"
                        data-shortcut="⌘X"
                    >
                        Cut
                    </li>
                    <li class="disabled" data-tool="copy" data-shortcut="⌘C">
                        Copy
                    </li>
                    <li class="disabled" data-tool="paste" data-shortcut="⌘V">
                        Paste
                    </li>
                    <li
                        class="border-top"
                        data-tool="select-all"
                        data-shortcut="⌘A"
                    >
                        Select all
                    </li>
                    <li
                        class="border-top"
                        data-tool="edit-all"
                        data-shortcut="⇪"
                    >
                        Edit all calendars at once
                    </li>
                </ul>
            </li>
            <li>
                View
                <ul>
                    <li
                        data-checkable
                        data-radio="view"
                        data-value="week"
                        data-shortcut="W"
                    >
                        Week view
                    </li>
                    <li
                        class="checked"
                        data-checkable
                        data-radio="view"
                        data-value="full"
                        data-shortcut="F"
                    >
                        Full view
                    </li>
                    <li
                        data-checkable
                        data-radio="view"
                        data-value="linear"
                        data-shortcut="L"
                    >
                        Linear view
                    </li>
                    <li class="border-top sub">
                        Show/hide days
                        <ul>
                            <li
                                class="checked"
                                data-checkable
                                data-setting="show-weekday"
                                data-value="1"
                            >
                                Monday
                            </li>
                            <li
                                class="checked"
                                data-checkable
                                data-setting="show-weekday"
                                data-value="2"
                            >
                                Tuesday
                            </li>
                            <li
                                class="checked"
                                data-checkable
                                data-setting="show-weekday"
                                data-value="3"
                            >
                                Wednesday
                            </li>
                            <li
                                class="checked"
                                data-checkable
                                data-setting="show-weekday"
                                data-value="4"
                            >
                                Thursday
                            </li>
                            <li
                                class="checked"
                                data-checkable
                                data-setting="show-weekday"
                                data-value="5"
                            >
                                Friday
                            </li>
                            <li
                                class="checked"
                                data-checkable
                                data-setting="show-weekday"
                                data-value="6"
                            >
                                Saturday
                            </li>
                            <li
                                class="checked"
                                data-checkable
                                data-setting="show-weekday"
                                data-value="0"
                            >
                                Sunday
                            </li>
                        </ul>
                    </li>
                    <li class="sub disabled">
                        Week starts on
                        <ul>
                            <li
                                class="checked"
                                data-checkable
                                data-radio="first-weekday"
                                data-value="1"
                            >
                                Monday
                            </li>
                            <li
                                data-checkable
                                data-radio="first-weekday"
                                data-value="2"
                            >
                                Tuesday
                            </li>
                            <li
                                data-checkable
                                data-radio="first-weekday"
                                data-value="3"
                            >
                                Wednesday
                            </li>
                            <li
                                data-checkable
                                data-radio="first-weekday"
                                data-value="4"
                            >
                                Thursday
                            </li>
                            <li
                                data-checkable
                                data-radio="first-weekday"
                                data-value="5"
                            >
                                Friday
                            </li>
                            <li
                                data-checkable
                                data-radio="first-weekday"
                                data-value="6"
                            >
                                Saturday
                            </li>
                            <li
                                data-checkable
                                data-radio="first-weekday"
                                data-value="0"
                            >
                                Sunday
                            </li>
                        </ul>
                    </li>
                </ul>
            </li> -->
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
