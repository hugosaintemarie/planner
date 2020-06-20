import history from './history';
import panel from './panel';
import selection from './selection';

export default {
    init() {
        // Shortcuts
        $(document).on('keydown', e => {
            // Disable custom shortcuts when editing a contenteditable
            if ($(e.target).is('[contenteditable]')) return;

            const ctrlOrMeta = e.metaKey || e.ctrlKey;

            if ([37, 38, 39, 40].includes(e.which)) {         // Arrow keys
                if (panel.isOpen) return;
                e.preventDefault();
                selection.moveSelection(e);
            }
            else if (e.which === 8) selection.emptySelection();                 // Backspace
            else if (e.which === 27) selection.narrowSelection();               // Esc
            else if (ctrlOrMeta && e.which === 65) selection.selectAll();       // A
            else if (ctrlOrMeta && e.which === 67) selection.copySelection();   // C
            else if (ctrlOrMeta && e.which === 86) selection.pasteSelection();  // V
            else if (ctrlOrMeta && e.which === 88) selection.cutSelection();    // X
            else if (ctrlOrMeta && e.which === 90) {                            // Z
                e.preventDefault();
                if (e.shiftKey) history.redo();
                else history.undo();
            }
        });

        // Enter key in contenteditable: blur
        $(document).on('keypress', '[contenteditable]', e => {
            if (e.which === 13) {
                const $el = $(e.target);
                $el.blur();

                // If leaving an event title, remove contenteditable
                if ($el.is('.title')) $el.removeAttr('contenteditable');

                // Remove selection if any
                window.getSelection().removeAllRanges();

                // Prevent panel opening
                return false;
            }
        });

        // // Click on contenteditable: select all
        // $(document).on('click', '[contenteditable]', e => {
        //     document.execCommand('selectAll', false, null);
        // });

        // // Tab to contenteditable: select all
        // $(document).on('keyup', '[contenteditable]', e => {
        //     if (e.which === 9) document.execCommand('selectAll', false, null);
        // });
    }
}