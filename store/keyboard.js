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
        // console.log(key);
        commit('keydown', key);
    },
    keyup({ commit }, key) {
        // console.log(key);
        commit('keyup', key);
    },
};

export const getters = {
    isKeydown: (state) => (key) => {
        if (key === 'meta')
            return state.keysdown.includes(17) || state.keysdown.includes(91);

        if (key === 'alt') key = 18;

        return state.keysdown.includes(key);
    },
};
