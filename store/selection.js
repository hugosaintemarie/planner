import {
    addDays,
    eachDayOfInterval,
    isEqual,
    getDay,
    getWeek,
    setDay,
    setWeek,
} from 'date-fns';

export const state = () => ({
    list: [],
    anchor: null,
    target: null,
});

export const mutations = {
    select: (state, interval) => {
        console.log({ interval });
        if (
            !state.list.some(
                (d) =>
                    isEqual(d.start, interval.start) &&
                    isEqual(d.end, interval.end)
            )
        ) {
            state.list.push(interval);
        }
    },
    unselect: (state, interval) => {
        const index = state.list.findIndex(
            (d) =>
                isEqual(d.start, interval.start) && isEqual(d.end, interval.end)
        );
        if (index > -1) state.list.splice(index, 1);
    },
    unselectAll: (state) => {
        state.list = [];
    },
    anchor(state, day) {
        state.anchor = day;
    },
    target(state, day) {
        state.target = day;
    },
};

export const actions = {
    select({ commit }, day) {
        commit('select', day);
    },
    selectRect({ state, commit }, day) {
        if (!day) day = state.target;
        commit('target', day);

        const weekStartsOn = 1;
        const anchor = state.anchor;

        const first = Math.min(anchor, day);
        const last = Math.max(anchor, day);

        const interval = eachDayOfInterval({ start: first, end: last });

        const lowestWeek = Math.min(
            ...interval.map((d) => getWeek(d, { weekStartsOn }))
        );
        const highestWeek = Math.max(
            ...interval.map((d) => getWeek(d, { weekStartsOn }))
        );

        let lowestDay = Math.min(getDay(anchor), getDay(day));
        let highestDay = Math.max(getDay(anchor), getDay(day));

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
    selectRange({ state, commit }, day) {
        if (!day) day = state.target;
        commit('target', day);

        const anchor = state.anchor;

        const first = Math.min(anchor, day);
        const last = Math.max(anchor, day);

        const interval = eachDayOfInterval({ start: first, end: last });

        for (const day of interval) commit('select', day);
    },
    unselect({ commit }, day) {
        commit('unselect', day);
    },
    unselectAll({ commit }) {
        commit('unselectAll');
    },
    update({ state, dispatch }, event) {
        const delta = {
            37: -1,
            38: -7,
            39: 1,
            40: 7,
        }[event.which];

        if (event.shiftKey) {
            dispatch('selectRect', addDays(state.target, delta));
        } else if (event.altKey) {
            dispatch('selectRange', addDays(state.target, delta));
        } else {
            dispatch('move', delta);
        }
    },
    move({ state, commit, dispatch }, delta) {
        const _list = state.list.slice();

        dispatch('unselectAll');

        for (const day of _list) commit('select', addDays(day, delta));

        commit('anchor', addDays(state.anchor, delta));
        commit('target', addDays(state.target, delta));
    },
    anchor({ commit }, day) {
        commit('anchor', day);
    },
    target({ commit }, day) {
        commit('target', day);
    },
    empty({ state }) {
        for (const day of state.list) {
            this.dispatch('events/emptyOnCalendarOnDay', day);
        }
    },
};

export const getters = {
    selected(state) {
        return state.list;
    },
};
