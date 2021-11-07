export const state = () => ({
    list: [],
    selected: null,
});

export const mutations = {
    add(state) {
        const id = state.list.length;
        state.list.push(new Calendar(id));
    },
    delete(state, id) {
        const index = state.list.findIndex((item) => item.id === id);
        state.list.splice(index, 1);
    },
    update(state, value) {
        state.list = value;
    },
    select(state, id) {
        state.selected = id;
    },
    rename(state, props) {
        const category = state.list.find((item) => item.id === props.id);
        category.title = props.title;
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
        return state.list.find((d) => d.id === state.selected);
    },
};

class Calendar {
    constructor(id) {
        this.id = id;
        this.title = `Calendar ${id}`;
    }
}
