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
            // console.log(e);

            return false;
        });

        $(document).on('click', '', e => {
            $('header ul li.open').removeClass('open');
        });
    }
}