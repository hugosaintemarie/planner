import data from './data';
import events from './events';

export default {
    actions: [],
    actionsIndex: 0,

    pushAction(action) {
        // console.log(action);
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
            for (const event of action.events) {
                if (action.type === 'addEvents') events.removeEvent(event);
            else if (action.type === 'removeEvents') events.buildEvent(event);
            else if (action.type === 'replaceEvents') events.replaceEvent(event, true);
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
            for (const event of action.events) {
                if (action.type === 'addEvents') events.buildEvent(event);
                else if (action.type === 'removeEvents') events.removeEvent(event)
                else if (action.type === 'replaceEvents') events.replaceEvent(event);
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
                const n = action.events.length;
                const s = n > 1 ? 's' : '';
        
                const text = {
                    'addEvents': `add ${n} event${s}`,
                    'removeEvents': `remove ${n} event${s}`,
                    'replaceEvents': `replace ${n} event${s}`
                }[action.type];
        
                return text;
            };

            const action = this.actions[this.actionsIndex + actionIndex];
            const text = `${label} ${buildActionText(action)}`;
            $(`nav [data-tool="${type}"]`).text(text).removeClass('disabled');
        }
    }
}