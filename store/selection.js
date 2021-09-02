import {
    addMinutes,
    addDays,
    eachDayOfInterval,
    isEqual,
    getMinutes,
    getHours,
    getDay,
    getWeek,
    setMinutes,
    setHours,
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
            if (highestDay === 0) highestDay = 8 - weekStartsOn;

            lowestDay = 8 - weekStartsOn;
            [lowestDay, highestDay] = [lowestDay, highestDay].sort();
        }

        for (let w = lowestWeek; w <= highestWeek; w += 1) {
            for (let d = lowestDay; d <= highestDay; d += 1) {
                let day = setDay(new Date(), d);
                day = setWeek(day, w, { weekStartsOn });

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
    selectSlotsRect({ state, commit }, { interval, slots }) {
        // if (!day) day = state.target;
        // commit('target', day);

        const anchor = state.anchor;

        const first = Math.min(anchor.start, interval.start);
        const last = Math.max(anchor.start, interval.start);

        const slot1 = setHours(
            setMinutes(new Date(0), getMinutes(first)),
            getHours(first)
        );
        const slot2 = setHours(
            setMinutes(new Date(0), getMinutes(last)),
            getHours(last)
        );
        const [firstSlot, lastSlot] = [slot1, slot2].sort();

        slots = slots.filter(
            (s) => s.start >= firstSlot && s.start <= lastSlot
        );

        const days = eachDayOfInterval({
            start: first,
            end: last,
        });

        for (const day of days) {
            for (const slot of slots) {
                commit('select', {
                    start: setHours(
                        setMinutes(new Date(day), getMinutes(slot.start)),
                        getHours(slot.start)
                    ),
                    end: setHours(
                        setMinutes(new Date(day), getMinutes(slot.end)),
                        getHours(slot.end)
                    ),
                });
            }
        }
    },
    selectSlotsRange({ state, commit }, day) {
        // if (!day) day = state.target;
        // commit('target', day);
        // const anchor = state.anchor;
        // const first = Math.min(anchor.start, day.start);
        // const last = Math.max(anchor.start, day.start);
        // const interval = eachDayOfInterval({ start: first, end: last });
        // for (const day of interval)
        //     commit('select', {
        //         start: startOfDay(day),
        //         end: endOfDay(day),
        //     });
    },
    unselect({ commit }, day) {
        commit('unselect', day);
    },
    unselectAll({ commit }) {
        commit('unselectAll');
    },
    update({ state, dispatch, rootGetters }, event) {
        if (rootGetters['views/current'] === 'full') {
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
                dispatch('moveDays', delta);
            }
        } else if (rootGetters['views/current'] === 'week') {
            const delta = {
                37: -24 * 60,
                38: 'prev',
                39: 24 * 60,
                40: 'next',
            }[event.which];

            // if (event.shiftKey) {
            //     dispatch('unselectAll');
            //     dispatch('selectDaysRect', {
            //         start: addDays(state.target.start, delta),
            //         end: addDays(state.target.end, delta),
            //     });
            // } else if (event.altKey) {
            //     dispatch('unselectAll');
            //     dispatch('selectDaysRange', {
            //         start: addDays(state.target.start, delta),
            //         end: addDays(state.target.end, delta),
            //     });
            // } else {
            dispatch('moveSlots', delta);
            // }
        }
    },
    moveDays({ state, commit, dispatch }, delta) {
        const _list = state.list.slice();

        dispatch('unselectAll');

        for (const interval of _list)
            commit('select', {
                start: addDays(interval.start, delta),
                end: addDays(interval.end, delta),
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
    moveSlots({ state, commit, dispatch, rootGetters }, delta) {
        const _list = state.list.slice();
        const slots = rootGetters['week/slots'];

        dispatch('unselectAll');

        if (isNaN(delta)) {
            for (const interval of _list) {
                let target;
                if (delta === 'prev') {
                    target = slots.find(
                        (d) =>
                            getHours(d.end) === getHours(interval.start) &&
                            getMinutes(d.end) === getMinutes(interval.start)
                    );
                } else if (delta === 'next') {
                    target = slots.find(
                        (d) =>
                            getHours(d.start) === getHours(interval.end) &&
                            getMinutes(d.start) === getMinutes(interval.end)
                    );
                }

                let start = setHours(interval.start, getHours(target.start));
                start = setMinutes(start, getMinutes(target.start));

                let end = setHours(interval.end, getHours(target.end));
                end = setMinutes(end, getMinutes(target.end));

                commit('select', { start, end });
            }
        } else {
            for (const interval of _list)
                commit('select', {
                    start: addMinutes(interval.start, delta),
                    end: addMinutes(interval.end, delta),
                });

            commit('anchor', {
                start: addMinutes(state.anchor.start, delta),
                end: addMinutes(state.anchor.end, delta),
            });

            commit('target', {
                start: addMinutes(state.target.start, delta),
                end: addMinutes(state.target.end, delta),
            });
        }
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
