export const state = () => ({
    list: {
        week: {
            icon: 'fas fa-th-large',
        },
        full: {
            icon: 'fas fa-th',
        },
        linear: {
            icon: 'fas fa-th-list',
        },
    },
    selected: 'full',
});

export const mutations = {
    select: (state, name) => {
        state.selected = name;
    },
};

export const actions = {
    select({ commit }, name) {
        commit('select', name);
    },
};
