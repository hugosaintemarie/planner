export const state = () => ({
    list: [],
});

export const mutations = {
    add(state, props) {
        const id = state.list.length;
        state.list.push(new Event(id, props));
    },
    delete(state, id) {
        const index = state.list.findIndex((item) => item.id === id);
        state.list.splice(index, 1);
    },
};

export const actions = {
    add({ commit }, category) {
        const selection = this.getters['selection/selected'];

        for (const date of selection) {
            commit('add', {
                category,
                calendar: this.getters['calendars/selected'],
                start: date,
                end: date,
            });
        }
    },
    delete({ commit }, id) {
        commit('delete', id);
    },
    emptyOnCalendarOnDay({ commit, getters }, day) {
        for (const event of getters.onCalendarOnDay(day)) {
            commit('delete', event.id);
        }
    },
};

export const getters = {
    onCalendar(state, _getters, _rootState, rootGetters) {
        return state.list.filter(
            (d) => d.calendar === rootGetters['calendars/selected']
        );
    },
    onCalendarOnDay: (_, getters) => (day) => {
        return getters.onCalendar.filter(
            (event) =>
                event.start.toString() === day.toString() &&
                event.end.toString() === day.toString()
        );
    },
};

class Event {
    constructor(id, props) {
        this.id = id;
        this.calendar = props.calendar;
        this.category = props.category;
        this.start = props.start;
        this.end = props.end;
    }
}
