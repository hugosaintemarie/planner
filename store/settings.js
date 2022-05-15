export const state = () => ({
    settings: {
        start: '2022-04-01',
        end: '2022-05-30',
    },
});

export const mutations = {
    set(state, { key, value }) {
        state.settings[key] = value;
    },
};

export const actions = {
    set({ commit }, { key, value }) {
        commit('set', { key, value });
    },
};

export const getters = {
    get: (state) => (prop) => {
        return state.settings[prop];
    },
};
