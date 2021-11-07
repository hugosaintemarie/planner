import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';

export const state = () => ({
    list: [],
    pending: null,
    currentID: null,
    origin: null,
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
    init(state, props) {
        const id = state.list.length;
        state.pending = new Event(id, props);
        state.currentID = id;
        state.origin = { start: props.start, end: props.end };
    },
    draw(state, day) {
        if (state.pending) {
            state.list.push(state.pending);
            state.pending = null;
        }

        const event = state.list.find((d) => d.id === state.currentID);

        event.start = startOfDay(Math.min(day, state.origin.start));
        event.end = endOfDay(Math.max(day, state.origin.end));
    },
};

export const actions = {
    add({ commit }, { category, selection, fullDay }) {
        if (!category) category = this.getters['categories/default'];
        if (!selection) selection = this.getters['selection/selected'];

        for (const interval of selection) {
            const event = {
                category,
                calendar: this.getters['calendars/selected'],
                start: interval.start,
                end: interval.end,
                fullDay,
            };

            commit('add', event);
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
    init({ commit }, day) {
        const event = {
            category: this.getters['categories/default'],
            calendar: this.getters['calendars/selected'],
            start: startOfDay(day),
            end: endOfDay(day),
            fullDay: true,
        };

        commit('init', event);
    },
    draw({ commit }, day) {
        commit('draw', day);
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
        this.fullDay = props.fullDay || false;
    }
}
