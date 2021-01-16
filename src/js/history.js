import data from './data';
import categories from './categories';
import events from './events';

export default {
    actions: [],
    actionsIndex: 0,

    pushAction(action) {
        this.actions.length = this.actionsIndex;
        this.actions.push(action);
        this.actionsIndex += 1;

        this.updateNav('undo', -1);
        this.updateNav('redo');
    },

    undo() {
        if (this.actionsIndex - 1 < 0) return;
        this.actionsIndex -= 1;
        const action = this.actions[this.actionsIndex];

        if (action.type.includes('Events')) {
            if (action.deleted) categories.build(action.category);

            for (const event of action.events) {
                if (action.type === 'addEvents') events.remove(event);
                else if (action.type === 'removeEvents') events.build(event);
                else if (action.type === 'replaceEvents') events.replace(event, true);
            }
        }

        if (this.actionsIndex === 0) this.updateNav('undo');
        else this.updateNav('undo', -1);

        this.updateNav('redo', 0);

        data.save();
    },

    redo() {
        if (this.actionsIndex + 1 > this.actions.length) return;
        const action = this.actions[this.actionsIndex];

        if (action.type.includes('Events')) {
            if (action.deleted) categories.delete(action.category.id);

            for (const event of action.events) {
                if (action.type === 'addEvents') events.build(event);
                else if (action.type === 'removeEvents') events.remove(event);
                else if (action.type === 'replaceEvents') events.replace(event, true);
            }
        }

        this.actionsIndex += 1;

        if (this.actions[this.actionsIndex]) this.updateNav('redo', 0);
        else this.updateNav('redo');

        this.updateNav('undo', -1);

        data.save();
    },

    updateNav(type, actionIndex) {
        const label = type === 'undo' ? 'Undo' : 'Redo';

        if (isNaN(actionIndex)) {
            // Disable nav undo/redo options
            $(`nav [data-tool="${type}"]`).text(label).addClass('disabled');
        } else {
            // Update nav undo/redo options text
            const buildActionText = action => {
                let text;

                if (action.type.includes('Events')) {
                    const n = action.events.length;
                    const s = n > 1 ? 's' : '';

                    if (action.deleted) {
                        text = `delete event ${action.category.title}`;
                    } else {
                        text = {
                            'addEvents': `add ${n} event${s}`,
                            'removeEvents': `remove ${n} event${s}`,
                            'replaceEvents': `replace ${n} event${s}`
                        }[action.type];
                    }
                }

                return text;
            };

            const action = this.actions[this.actionsIndex + actionIndex];
            const text = `${label} ${buildActionText(action)}`;
            $(`nav [data-tool="${type}"]`).text(text).removeClass('disabled');
        }
    }
}