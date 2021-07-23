import { eachDayOfInterval, getDay, getWeek, setDay, setWeek } from 'date-fns';

export const state = () => ({
    list: [],
});

export const mutations = {
    select: (state, day) => {
        const string = day.toString();
        if (!state.list.includes(string)) state.list.push(string);
    },
    unselect: (state, day) => {
        const index = state.list.indexOf(day.toString());
        if (index > -1) state.list.splice(index, 1);
    },
    unselectAll: (state) => {
        state.list = [];
    },
};

export const actions = {
    select({ commit }, day) {
        commit('select', day);
    },
    selectRect({ commit }, params) {
        const weekStartsOn = 1;
        const { day, selectedFirst } = params;

        const first = Math.min(selectedFirst, day);
        const last = Math.max(selectedFirst, day);

        const interval = eachDayOfInterval({ start: first, end: last });

        const lowestWeek = Math.min(
            ...interval.map((d) => getWeek(d, { weekStartsOn }))
        );
        const highestWeek = Math.max(
            ...interval.map((d) => getWeek(d, { weekStartsOn }))
        );

        let lowestDay = Math.min(getDay(selectedFirst), getDay(day));
        let highestDay = Math.max(getDay(selectedFirst), getDay(day));

        if (lowestDay === 0) {
            lowestDay = 8 - weekStartsOn;
            [lowestDay, highestDay] = [lowestDay, highestDay].sort();
        }

        for (let w = lowestWeek; w <= highestWeek; w += 1) {
            for (let d = lowestDay; d <= highestDay; d += 1) {
                let day = setWeek(new Date(), w);
                day = setDay(day, d);
                day.setHours(0, 0, 0);
                commit('select', day);
            }
        }
    },
    selectRange({ commit }, params) {
        const { day, selectedFirst } = params;

        const first = Math.min(selectedFirst, day);
        const last = Math.max(selectedFirst, day);

        const interval = eachDayOfInterval({ start: first, end: last });

        commit('unselectAll');

        for (const day of interval) commit('select', day);
    },
    unselect({ commit }, day) {
        commit('unselect', day);
    },
    unselectAll({ commit }) {
        commit('unselectAll');
    },
};

export const getters = {
    selected(state) {
        return state.list;
    },
};
