import selection from './selection';

export default {
    isOpen: false,

    init() {
        $(document).on('keypress', e => {
            if (e.which === 13) {
                if (!selection.selectedDays.length) return;

                if (!this.isOpen) this.openPanel();
                else this.confirm();
            }
        });
    },

    openPanel() {
        console.log('open');
        this.isOpen = true;
    },

    confirm() {
        this.isOpen = false;
    }
}