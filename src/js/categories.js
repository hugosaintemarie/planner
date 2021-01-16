import data from './data';
import events from './events';
import stats from './stats';

export default {
    list: {},
    id: -1,

    reset() {
        this.list = {};
        this.id = -1;

        $('.categories-wrap ul').empty();
        $('.stats-wrap .stats').empty();
    },

    get() {
        return this.list;
    },

    init() {
        // Add new category
        $(document).on('click', '.categories-wrap .add', () => {
            this.build();
            return false;
        });

        // Rename category
        $(document).on('input', '.categories-wrap ul span', e => {
            const $el = $(e.target);
            this.rename($el);
        });

        // Insert event
        $(document).on('click', '.categories-wrap ul li', e => {
            const $el = $(e.target);
            if ($el.is('.tools') || $el.parents().is('.tools')) return;

            const $event = $el.closest('li');
            const category = parseInt($event.attr('data-category'));
            events.insert(category);
        });

        // Open dropdown menu
        $(document).on('click', '.categories-wrap ul li [data-tool="dropdown"]', e => {
            // Close any open dropdown menu
            $('.dropdown.visible').removeClass('visible');
            $('#color-swatch').removeClass('visible');

            const $dropdown = $(e.target).closest('li').find('.dropdown');
            $dropdown.toggleClass('visible');
            e.stopPropagation();
        });

        // Click outside
        $(document).on('click', e => {
            if ($(e.target).is('#color-swatch')) return;

            // Close dropdown menu
            $('.dropdown.visible').removeClass('visible');
            $('[data-day].open').removeClass('open');
            $('#color-swatch').removeClass('visible');

            if ($(e.target).parents().is('[data-tool="dropdown"], .dropdown')) return;

            // Remove contenteditable attr
            $('.categories-wrap ul li .title[contenteditable]').removeAttr('contenteditable');

            // Unselect any selection
            // if (!$(e.target).is('[contenteditable]')) window.getSelection().removeAllRanges();
        });

        // Save category rename on blur (for empty names)
        $(document).on('blur', '.categories-wrap .title', e => {
            this.rename($(e.currentTarget));
        });

        // Rename category
        $(document).on('click', '.categories-wrap ul li [data-tool="rename"]', e => {
            const $title = $(e.target).closest('li').find('span.title');
            $title.attr('contenteditable', 'true').focus();

            const setEndOfContenteditable = (contentEditableElement) => {
                let range = document.createRange();
                range.selectNodeContents(contentEditableElement);
                range.collapse(false);
                let selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }

            setEndOfContenteditable($title[0]);

            // Close dropdown menu
            $('.dropdown.visible').removeClass('visible');

            // Prevent li click
            return false;
        });

        // Open color swatch
        $(document).on('click', '.categories-wrap ul li [data-tool="color"]', e => {
            const $el = $(e.target.closest('li'));

            // Select current category color
            $('#color-swatch .color.selected').removeClass('selected');
            $($('#color-swatch .color').toArray().find(c => $(c).attr('data-color') === $el.attr('data-color'))).addClass('selected');

            // Open swatch
            $('#color-swatch')
                .css({
                    'top': $el.position().top + $el.outerHeight(),
                    'left': $el.position().left
                })
                .addClass('visible')
                .attr('data-category', $el.attr('data-category'));

            // Close dropdown
            $('.dropdown.visible').removeClass('visible');

            return false;
        });

        // Change category color
        $(document).on('click', '#color-swatch .color', e => {
            const $color = $(e.target);
            const id = parseInt($('#color-swatch').attr('data-category'));

            // Select color
            $('#color-swatch .color.selected').removeClass('selected');
            $color.addClass('selected');

            // Update category, events and stats
            const color = $color.attr('data-color');
            $(`.categories-wrap ul li[data-category="${id}"], .event[data-category="${id}"]`).attr('data-color', color);
            $(`.stat[data-category="${id}"] .event-icon`).attr('data-color', color);

            // Update data
            this.list[id].color = parseInt($color.attr('data-color'));
            data.save();

            return false;
        });

        // Delete category
        $(document).on('click', '.categories-wrap ul li [data-tool="delete"]', e => {
            const $category = $(e.target).closest('li');
            const id = parseInt($category.attr('data-category'));
            const category = {
                id,
                title: $category.find('.title').text(),
                index: $category.index(),
                color: $category.attr('data-color')
            };

            this.delete(id);

            // TODO: don't pass category
            events.removeBy({ category: id }, category);
            data.save();
        });

        // Selected event
        // $(document).on('mousedown', '.categories-wrap ul li', e => {
        //     const $el = $(e.currentTarget);
        //     $el.siblings('.selected').removeClass('selected');
        //     $el.toggleClass('selected');
        // });

        for (let i = 0; i <= 19; i += 1) {
            $('#color-swatch').append(`<div class="color" data-color="${i}"></div>`);
        }
    },

    build(categories) {
        if (!Array.isArray(categories)) categories = [categories];

        for (const category of categories) {
            const id = category && !isNaN(category.id) ? category.id : ++this.id;
            const color = category && !isNaN(category.color) ? category.color : this.id;

            const li = `<li data-category="${id}" class="sortable" data-color="${color}">
                <span class="title" ${!category ? 'contenteditable' : ''} spellcheck="false">${category?.title ? category.title : ''}</span>
                <span class="tools">
                    <i class="fas fa-angle-down" data-tool="dropdown"></i>
                    <i data-tool="sort">⋮⋮</i>
                    <span class="dropdown">
                        <span data-tool="rename"><i class="fas fa-pen"></i>Rename</span>
                        <span data-tool="color"><i class="fas fa-palette"></i>Change color</span>
                        <span class="border-top" data-tool="delete"><i class="far fa-trash-alt"></i>Delete</span>
                    </span>
                </span>
            </li>`;

            const $ul = $('.categories-wrap ul');
            if (category?.index) $ul.find('li').eq(category.index - 1).after(li);
            else if (category?.index === 0) $ul.prepend(li);
            else $ul.append(li);

            // Select new event
            // $ul.find('li.selected').removeClass('selected');
            // $ul.find('li:last-child').addClass('selected');

            // Focus span if empty
            if (!category) $ul.find('li:last-child .title').focus();

            // Save data
            this.list[id] = {
                ...category,
                id,
                color
            };
        }

        stats.update();
    },

    rename($el) {
        const val = $el.text();
        const id = parseInt($el.closest('li').attr('data-category'));

        $(`.event[data-category="${id}"] span`).text(val);

        // Update data
        this.list[id].title = val;

        stats.update();
        data.save();
    },

    delete(id) {
        const $category = $(`.categories-wrap ul li[data-category="${id}"]`);
        $category.remove();

        stats.update();

        // Update data
        delete this.list[id];
        data.save();
    },

    findBy(options) {
        // if (options.type)
        return this.list[options.category];
    },

    reorder() {
        for (const category of Object.values(this.list)) {
            category.order = parseInt($(`.categories-wrap ul li[data-category="${category.id}"]`).attr('data-order'));
        }
    }
}