import Vue from 'vue';

export const state = () => ({
    list: {},
    selected: null,
});

export const mutations = {
    add(state) {
        const id = Object.keys(state.list).length
            ? Math.max(...Object.keys(state.list)) + 1
            : 0;
        Vue.set(state.list, id, new Calendar(id));
    },
    delete(state, id) {
        state.list[id] = null;
    },
    select(state, id) {
        state.selected = id;
    },
    rename(state, props) {
        Vue.set(state.list[props.id], 'title', props.title);
    },
};

export const actions = {
    add({ commit }) {
        commit('add');
    },
    delete({ commit }, id) {
        commit('delete', id);
    },
    select({ commit }, id) {
        commit('select', id);
    },
    rename({ state, commit }, title) {
        commit('rename', { id: state.selected, title });
    },
};

export const getters = {
    selected(state) {
        return state.list[state.selected];
    },
};

class Calendar {
    constructor(id) {
        this.id = id;
        this.title = `Calendar ${id}`;
    }
}
