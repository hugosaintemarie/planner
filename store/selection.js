import {
    addDays,
    eachDayOfInterval,
    isEqual,
    getDay,
    getWeek,
    setDay,
    setWeek,
    startOfDay,
    endOfDay,
} from 'date-fns';

export const state = () => ({
    list: [],
    anchor: null,
    target: null,
});

export const mutations = {
    select: (state, interval) => {
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
    selectDaysRect({ state, commit }, day) {
        if (!day) day = state.target;
        commit('target', day);

        const weekStartsOn = 1;
        const anchor = state.anchor;

        const first = Math.min(anchor.start, day.start);
        const last = Math.max(anchor.start, day.start);

        const interval = eachDayOfInterval({ start: first, end: last });

        const lowestWeek = Math.min(
            ...interval.map((d) => getWeek(d, { weekStartsOn }))
        );
        const highestWeek = Math.max(
            ...interval.map((d) => getWeek(d, { weekStartsOn }))
        );

        let lowestDay = Math.min(getDay(anchor.start), getDay(day.start));
        let highestDay = Math.max(getDay(anchor.start), getDay(day.start));

        if (lowestDay === 0) {
            lowestDay = 8 - weekStartsOn;
            [lowestDay, highestDay] = [lowestDay, highestDay].sort();
        }

        for (let w = lowestWeek; w <= highestWeek; w += 1) {
            for (let d = lowestDay; d <= highestDay; d += 1) {
                const day = setWeek(setDay(new Date(), d), w);
                commit('select', {
                    start: startOfDay(day),
                    end: endOfDay(day),
                });
            }
        }
    },
    selectDaysRange({ state, commit }, day) {
        if (!day) day = state.target;
        commit('target', day);

        const anchor = state.anchor;

        const first = Math.min(anchor.start, day.start);
        const last = Math.max(anchor.start, day.start);

        const interval = eachDayOfInterval({ start: first, end: last });

        for (const day of interval)
            commit('select', {
                start: startOfDay(day),
                end: endOfDay(day),
            });
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
            dispatch('unselectAll');
            dispatch('selectDaysRect', {
                start: addDays(state.target.start, delta),
                end: addDays(state.target.end, delta),
            });
        } else if (event.altKey) {
            dispatch('unselectAll');
            dispatch('selectDaysRange', {
                start: addDays(state.target.start, delta),
                end: addDays(state.target.end, delta),
            });
        } else {
            dispatch('move', delta);
        }
    },
    move({ state, commit, dispatch }, delta) {
        const _list = state.list.slice();

        dispatch('unselectAll');

        for (const day of _list)
            commit('select', {
                start: addDays(day.start, delta),
                end: addDays(day.end, delta),
            });

        commit('anchor', {
            start: addDays(state.anchor.start, delta),
            end: addDays(state.anchor.end, delta),
        });

        commit('target', {
            start: addDays(state.target.start, delta),
            end: addDays(state.target.end, delta),
        });
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
