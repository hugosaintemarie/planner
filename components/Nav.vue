<template>
    <nav>
        <ul>
            <li>
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
            </li>
        </ul>
    </nav>
</template>
