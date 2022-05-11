export const state = () => ({
    list: [],
    id: 0,
});

export const mutations = {
    add(state, action) {
        state.list.push(action);
    },
    remove(state, index) {
        const _index = state.list.findIndex((item) => item.index === index);
        state.list.splice(_index, 1);
    },
    increment(state) {
        state.id++;
    },
};

export const actions = {
    add({ commit, getters }, toast) {
        commit('increment');
        const index = getters.count;
        console.log(index);

        toast.visible = true;
        toast.index = index;
        commit('add', toast);

        setTimeout(() => {
            commit('remove', index);
        }, toast.timeout || 10000);
    },
    undo({ state, commit, dispatch }, index) {
        const item = state.list.find((item) => item.index === index);
        if (!item) return;

        const { action, data } = item.undo;
        dispatch(action, data, { root: true });

        commit('remove', index);
    },
};

export const getters = {
    visible(state) {
        return state.list;
    },
    count(state) {
        return state.id;
    },
};
