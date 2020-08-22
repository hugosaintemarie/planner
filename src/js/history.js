import data from './data';
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

        if (action.type === 'addEvents') for (const event of action.events) events.removeEvent(event);
        else if (action.type === 'removeEvents') for (const event of action.events) events.buildEvent(event);
        else if (action.type === 'replaceEvents') for (const event of action.events) events.replaceEvent(event, true);

        if (this.actionsIndex === 0) this.updateNav('undo');
        else this.updateNav('undo', -1);

        this.updateNav('redo', 0);

        data.save();
    },

    redo() {
        if (this.actionsIndex + 1 > this.actions.length) return;
        const action = this.actions[this.actionsIndex];
        if (action.type === 'addEvents') for (const event of action.events) events.buildEvent(event);
        else if (action.type === 'removeEvents') for (const event of action.events) events.removeEvent(event)
        else if (action.type === 'replaceEvents') for (const event of action.events) events.replaceEvent(event);
        ;
        
        this.actionsIndex += 1;

        if (this.actions[this.actionsIndex]) this.updateNav('redo', 0);
        else this.updateNav('redo');

        this.updateNav('undo', -1);

        data.save();
    },

    updateNav(type, actionIndex) {
        if (isNaN(actionIndex)) {
            // Disable nav undo/redo options
            $(`nav [data-tool="${type}"]`).text(type === 'undo' ? 'Undo' : 'Redo').addClass('disabled');
        } else {
            // Update nav undo/redo options text
            const buildActionText = (action) => {
                const n = action.type === 'addEvents' ? action.events.length : action.events.length / 2;
                const s = n > 1 ? 's' : '';
        
                const text = {
                    'addEvents': `add ${n} event${s}`,
                    'removeEvents': `remove ${n} event${s}`,
                    'replaceEvents': `replace ${n} event${s}`
                }[action.type];
        
                return text;
            };

            const action = this.actions[this.actionsIndex + actionIndex];
            $(`nav [data-tool="${type}"]`).text(`${type === 'undo' ? 'Undo' : 'Redo'} ${buildActionText(action)}`).removeClass('disabled');
        }
    }
}