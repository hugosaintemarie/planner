import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

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

        for (const interval of selection) {
            commit('add', {
                category,
                calendar: this.getters['calendars/selected'],
                start: interval.start,
                end: interval.end,
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
    onCalendar: (state, _getters, _rootState, rootGetters) => (calendar) => {
        if (!calendar) calendar = rootGetters['calendars/selected'];
        return state.list.filter((d) => d.calendar === calendar);
    },
    onCalendarOnDay: (_, getters) => (day, calendar) => {
        return getters.onCalendar(calendar).filter((event) =>
            isWithinInterval(day, {
                start: startOfDay(event.start),
                end: endOfDay(event.end),
            })
        );
    },
    // onCalendarOnSlot: (_, getters) => (day, slot) => {
    //     const start = setHours(
    //         setMinutes(new Date(day), slot.start.getMinutes()),
    //         slot.start.getHours()
    //     );
    //     const end = setHours(
    //         setMinutes(new Date(day), slot.end.getMinutes()),
    //         slot.end.getHours()
    //     );

    //     return getters.onCalendar.filter(
    //         (event) =>
    //             event.start.toString() === start.toString() &&
    //             event.end.toString() === end.toString()
    //     );
    // },
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
