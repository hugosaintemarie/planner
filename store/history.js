export const state = () => ({
    list: [],
});

export const mutations = {
    add(state, action) {
        console.log(action);
        state.list.push(action);
    },
    undo(state) {
        console.log('undo', state);
    },
};

export const actions = {
    undo({ commit }) {
        commit('undo');
    },
};
