export default {
    init() {
        this.update();

        $(document).on('mouseenter', '.stat', e => {
            const type = $(e.target).closest('.stat').attr('data-type');
            $('.calendar-wrap .event').css('opacity', '.3');
            $(`.calendar-wrap .event[data-type="${type}"`).css('opacity', '');
        });

        $(document).on('mouseleave', '.stat', () => {
            $('.calendar-wrap .event').css('opacity', '');
        });
    },

    update() {
        const events = $('.events-wrap ul li').toArray().map(el => {
            const $el = $(el);
            return {
                title: $el.find('span.title').text(),
                type: parseInt($el.attr('data-type')),
                color: $el.css('background-color')
            }
        });

        
        let html = '';
        for (const event of events) {
            const count = $(`.calendar-wrap .calendar.selected .event[data-type="${event.type}"]`).length;

            html += `<div class="stat" data-type="${event.type}">
                <p>
                    <span class="event-icon" style="background-color: ${event.color}"></span>
                    ${event.title}
                    <span class="count">${count}</span>
                </p>
            </div>`;
        }
        $('.stats').html(html);
    }
}