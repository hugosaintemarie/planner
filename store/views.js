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
    showDay: (state, index) => {
        state.days[index].checked = true;
    },
    hideDay: (state, index) => {
        state.days[index].checked = false;
    },
    toggleDay: (state, index) => {
        state.days[index].checked = !state.days[index].checked;
    },
};

export const actions = {
    select({ commit }, name) {
        commit('select', name);
    },
    showDay({ commit }, index) {
        commit('showDay', index);
    },
    hideDay({ commit, dispatch, getters }, index) {
        commit('hideDay', index);
        dispatch('selection/unselectAll', null, { root: true });
        dispatch(
            'toasts/add',
            {
                msg: `${getters.titleByIndex(index)} column hidden`,
                undo: { action: 'views/showDay', data: index },
            },
            { root: true }
        );
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
    titleByIndex: (state) => (index) => {
        return state.days[index].title;
    },
};
