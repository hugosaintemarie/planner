export const state = () => ({
    keysdown: [],
});

export const mutations = {
    keydown(state, key) {
        if (!state.keysdown.includes(key)) state.keysdown.push(key);
    },
    keyup(state, key) {
        state.keysdown.splice(state.keysdown.indexOf(key), 1);
    },
};

export const actions = {
    keydown({ commit }, key) {
        commit('keydown', key);
    },
    keyup({ commit }, key) {
        commit('keyup', key);
    },
};

export const getters = {
    isKeydown: (state) => (key) => {
        if (key === 'shift') return state.keysdown.includes(16);
        if (key === 'meta')
            return [17, 91, 93].some((k) => state.keysdown.includes(k));
        if (key === 'alt') key = 18;

        return state.keysdown.includes(key);
    },
};
