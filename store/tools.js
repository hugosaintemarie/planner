export const state = () => ({
    list: {
        select: {
            icon: 'fas fa-plus',
        },
        draw: {
            icon: 'fas fa-mouse-pointer',
        },
    },
    selected: 'select',
});

export const mutations = {
    select(state, name) {
        state.selected = name;
    },
};

export const actions = {
    select({ commit }, name) {
        commit('select', name);
    },
};

export const getters = {
    selected(state) {
        return state.selected;
    },
};
