export const state = () => ({
    list: [],
});

export const mutations = {
    select: (state, day) => {
        const string = day.toString();
        if (!state.list.includes(string)) state.list.push(string);
    },
    unselect: (state, day) => {
        state.list.splice(state.list.indexOf(day.toString()), 1);
    },
};

export const actions = {
    select({ commit }, day) {
        commit('select', day);
    },
    unselect({ commit }, day) {
        commit('unselect', day);
    },
};

export const getters = {
    selected(state) {
        return state.list;
    },
};
