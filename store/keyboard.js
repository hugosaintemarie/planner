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
        const keys = [key];

        // Support aliases
        if (key === 'shift') keys.push(16);
        if (key === 'meta') keys.push(17, 91, 93);
        if (key === 'alt') keys.push(18);

        return keys.some((k) => state.keysdown.includes(k));
    },
};
