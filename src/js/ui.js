export default {
    init() {
        $(document).on('click', 'header nav>ul>li', e => {
            const $el = $(e.currentTarget);
            $el.siblings('.open').removeClass('open');
            $el.toggleClass('open');

            return false;
        });

        $(document).on('mouseenter', 'header nav>ul>li', e => {
            const $el = $(e.currentTarget);
            if ($el.siblings('.open').length) {
                $('header ul li.open').removeClass('open');
                $el.toggleClass('open');
            }

            return false;
        });

        $(document).on('click', 'header nav>ul>li li:not(.disabled)', e => {
            const $target = $(e.currentTarget);
            if ($target.attr('data-checkable') === '') {
                if ($target.attr('data-radio')) this.onRadioChange($target);
                else $target.toggleClass('checked');
            }

            return false;
        });

        $(document).on('click', '', e => {
            $('header ul li.open').removeClass('open');
        });
    },

    onRadioChange($target) {
        const radio = $target.attr('data-radio');
        $(`nav [data-radio="${radio}"]`).removeClass('checked');
        $target.addClass('checked');

        if (radio === 'view') {
            console.log($target.attr('data-value'));
        }
    }
}