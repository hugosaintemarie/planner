export default {
    init() {
        this.update();

        $(document).on('mouseenter', '.stat', e => {
            const type = $(e.target).closest('.stat').attr('data-category');
            $('.calendar-wrap .event').css('opacity', '.3');
            $(`.calendar-wrap .event[data-category="${type}"`).css('opacity', '');
        });

        $(document).on('mouseleave', '.stat', () => {
            $('.calendar-wrap .event').css('opacity', '');
        });
    },

    update() {
        const events = $('.categories-wrap ul li').toArray().map(el => {
            const $el = $(el);
            return {
                title: $el.find('span.title').text(),
                category: parseInt($el.attr('data-category')),
                color: $el.attr('data-color')
            }
        });

        
        let html = '';
        for (const event of events) {
            const count = $(`.calendar-wrap .calendar.selected .event[data-category="${event.category}"]`).length;

            html += `<div class="stat" data-category="${event.category}">
                <p>
                    <span class="event-icon" data-color="${event.color}"></span>
                    ${event.title}
                    <span class="count">${count}</span>
                </p>
            </div>`;
        }
        $('.stats').html(html);
    }
}