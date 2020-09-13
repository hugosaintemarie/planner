export default {
    timeout: null,
    undo: null,

    init() {
        $(document).on('click', '.toast', () => {
           this.hide();
        });

        $(document).on('click', '.toast [data-tool="undo"]', () => {
            this.undo();
        });
    },

    show(text, undo, timeout = 10000) {
        let html = `<p>${text}`;

        if (undo) {
            html += `<span data-tool="undo">Undo</span>`;
            this.undo = undo;
        }
        html += '</p>';

        $('.toast').html(html).addClass('visible');

        if (timeout !== 0) {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.hide();
            }, timeout);
        }
    },

    hide() {
        $('.toast').removeClass('visible');
    }
}