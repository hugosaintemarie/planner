import data from './data';
import events from './events';

export default {
    actions: [],
    actionsIndex: 0,

    pushAction(action) {
        this.actions.length = this.actionsIndex;
        this.actions.push(action);
        this.actionsIndex += 1;
    },

    undo() {
        if (this.actionsIndex - 1 < 0) return;
        this.actionsIndex -= 1;
        const action = this.actions[this.actionsIndex];

        if (action.type === 'addEvents') for (const event of action.events) events.removeEvent(event);
        else if (action.type === 'removeEvents') for (const event of action.events) events.buildEvent(event);
        else if (action.type === 'replaceEvents') for (const event of action.events) events.replaceEvent(event, true);

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

        data.save();
    }
}