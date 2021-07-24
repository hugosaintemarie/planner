export const state = () => ({
    list: {
        select: {
            icon: 'fas fa-plus',
            tooltip: 'Select',
            shortcut: 'S',
        },
        draw: {
            icon: 'fas fa-mouse-pointer',
            tooltip: 'Draw',
            shortcut: 'D',
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
