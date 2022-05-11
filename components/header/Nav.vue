<template>
    <nav v-click-outside="close">
        <ul class="flex">
            <li
                v-for="(item, title, index) in nav"
                :key="title"
                class="relative p-4 cursor-pointer select-none hover:bg-gray-700"
                :class="[
                    title === openNav ? 'bg-gray-700' : '',
                    index === 0 ? 'font-bold' : '',
                ]"
                @click="open(title)"
                @mouseenter="enter(title)"
            >
                {{ title }}

                <div
                    class="absolute left-0 font-normal bg-gray-800 border border-gray-700 shadow-lg cursor-default top-full rounded-b-md"
                    :class="title === openNav ? 'block' : 'hidden'"
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
                            class="relative flex items-center px-4 py-2 border-gray-700 group whitespace-nowrap"
                            :class="[
                                entry.disabled
                                    ? 'text-gray-500'
                                    : 'text-white hover:bg-gray-700 cursor-pointer',
                                entry.entries && !entry.disabled
                                    ? 'submenu'
                                    : '',
                            ]"
                            @click="entry.onclick ? entry.onclick() : null"
                            @mouseenter="addTrap"
                            @mousemove="moveTrap"
                            @mouseleave="removeTrap"
                        >
                            <i
                                v-if="entry.checked"
                                class="absolute fas fa-check left-2"
                            ></i>
                            <span class="ml-4 mr-12">
                                {{ entry.title }}
                            </span>
                            <i
                                v-if="entry.entries"
                                class="ml-auto -mr-1 text-xs fas fa-chevron-right"
                            ></i>
                            <span
                                v-if="entry.shortcut"
                                class="ml-auto -mr-1 text-xs"
                                :class="
                                    entry.disabled
                                        ? 'text-gray-500'
                                        : 'text-gray-400'
                                "
                            >
                                {{ entry.shortcut }}
                            </span>
                            <svg
                                v-if="entry.entries"
                                class="absolute top-0 left-0 z-50 w-full pointer-events-none"
                            ></svg>
                            <ul
                                v-if="entry.entries && !entry.disabled"
                                class="absolute top-0 hidden bg-gray-800 border border-gray-700 rounded-md rounded-tl-none left-full group-hover:block"
                            >
                                <li
                                    v-for="(subentry, j) in entry.entries"
                                    :key="j"
                                    class="relative flex items-center px-4 py-2 border-gray-700 whitespace-nowrap"
                                    :class="[
                                        subentry.disabled
                                            ? 'text-gray-500'
                                            : 'text-white hover:bg-gray-700',
                                        j === entry.entries.length - 1
                                            ? 'rounded-b'
                                            : '',
                                        j === 0 ? 'rounded-tr' : '',
                                    ]"
                                    @click="
                                        entry.onchildclick
                                            ? entry.onchildclick(j)
                                            : null
                                    "
                                >
                                    <span class="mr-12">
                                        {{ subentry.title }}
                                    </span>
                                    <i
                                        v-show="subentry.checked"
                                        class="absolute text-sm right-3 fas fa-check"
                                    ></i>
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
import vClickOutside from 'v-click-outside';

export default {
    directives: {
        clickOutside: vClickOutside.directive,
    },
    data() {
        return {
            openNav: null,
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
                            { title: 'Open…', disabled: true },
                            { title: 'Save as .planner…', disabled: true },
                        ],
                        [{ title: 'Project settings…', disabled: true }],
                        [{ title: 'Delete project', disabled: true }],
                    ],
                },
                Edit: {
                    entries: [
                        [
                            { title: 'Undo', disabled: true, shortcut: '⌘Z' },
                            { title: 'Redo', disabled: true, shortcut: '⇧⌘Z' },
                        ],
                        [
                            { title: 'Cut', disabled: true, shortcut: '⌘X' },
                            { title: 'Copy', disabled: true, shortcut: '⌘C' },
                            { title: 'Paste', disabled: true, shortcut: '⌘V' },
                        ],
                        [
                            {
                                title: 'Select all',
                                disabled: true,
                                shortcut: '⌘A',
                            },
                        ],
                        [
                            {
                                title: 'Edit all calendars at once',
                                disabled: true,
                            },
                        ],
                    ],
                },
                View: {
                    entries: [
                        [
                            {
                                title: 'Week view',
                                checked:
                                    this.$store.state.views.selected === 'week',
                                shortcut: 'W',
                                onclick: () => {
                                    this.$store.dispatch(
                                        'views/select',
                                        'week'
                                    );
                                },
                            },
                            {
                                title: 'Full view',
                                checked:
                                    this.$store.state.views.selected === 'full',
                                shortcut: 'F',
                                onclick: () => {
                                    this.$store.dispatch(
                                        'views/select',
                                        'full'
                                    );
                                },
                            },
                            {
                                title: 'Linear view',
                                checked:
                                    this.$store.state.views.selected ===
                                    'linear',
                                shortcut: 'L',
                                onclick: () => {
                                    this.$store.dispatch(
                                        'views/select',
                                        'linear'
                                    );
                                },
                            },
                        ],
                        [
                            {
                                title: 'Show/hide days',
                                selectable: true,
                                entries: this.$store.getters['views/days'],
                                onchildclick: (index) => {
                                    this.$store.dispatch(
                                        'views/toggleDay',
                                        index
                                    );
                                },
                            },
                            {
                                title: 'Week starts on',
                                disabled: true,
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
        open(title) {
            this.openNav = title;
        },
        enter(title) {
            if (this.openNav) this.openNav = title;
        },
        addTrap(event) {
            // Create triangle safezone
            const li = event.target.closest('li');

            if (!li.classList.contains('submenu')) return;

            const svg = li.querySelector('svg');
            const width = li.offsetWidth;
            const height = li.querySelector('ul').offsetHeight;
            svg.style.height = height;

            const polygon = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'polygon'
            );

            polygon.classList.add('pointer-events-auto', 'opacity-0');
            svg.append(polygon);

            polygon.setAttribute(
                'points',
                `${event.clientX - li.getBoundingClientRect().left},${
                    event.clientY - li.getBoundingClientRect().top
                } ${width},0 ${width},${height}`
            );
        },
        moveTrap(event) {
            // Update triangle safezone
            const li = event.target.closest('li');

            if (!li.classList.contains('submenu')) return;

            const width = li.offsetWidth;
            const height = li.querySelector('ul').offsetHeight;
            const svg = li.querySelector('svg');

            const polygon = svg.querySelector('polygon');

            setTimeout(() => {
                polygon.setAttribute(
                    'points',
                    `${event.clientX - li.getBoundingClientRect().left},${
                        event.clientY - li.getBoundingClientRect().top
                    } ${width},0 ${width},${height}`
                );
            }, 40);
        },
        removeTrap(event) {
            // Remove triangle safezone
            const li = event.target.closest('li');
            if (!li.classList.contains('submenu')) return;

            const polygon = li.querySelector('polygon');
            polygon.remove();
        },
        close() {
            this.openNav = null;
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
