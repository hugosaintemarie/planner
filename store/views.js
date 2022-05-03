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
    days: [
        { title: 'Monday', checked: true },
        { title: 'Tuesday', checked: true },
        { title: 'Wednesday', checked: true },
        { title: 'Thursday', checked: true },
        { title: 'Friday', checked: true },
        { title: 'Saturday', checked: true },
        { title: 'Sunday', checked: true },
    ],
});

export const mutations = {
    select: (state, name) => {
        state.selected = name;
    },
    toggleDay: (state, index) => {
        state.days[index].checked = !state.days[index].checked;
    },
};

export const actions = {
    select({ commit }, name) {
        commit('select', name);
    },
    toggleDay({ commit, dispatch }, index) {
        commit('toggleDay', index);
        dispatch('selection/unselectAll', null, { root: true });
    },
};

export const getters = {
    current(state) {
        return state.selected;
    },
    days(state) {
        return state.days;
    },
};
