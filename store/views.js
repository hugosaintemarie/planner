export const state = () => ({
    list: {
        week: {
            icon: 'fas fa-th-large',
            tooltip: 'Week view',
            shortcut: 'W',
        },
        full: {
            icon: 'fas fa-th',
            tooltip: 'Full view',
            shortcut: 'F',
        },
        linear: {
            icon: 'fas fa-th-list',
            tooltip: 'Linear view',
            shortcut: 'L',
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
