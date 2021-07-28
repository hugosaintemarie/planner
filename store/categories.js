export const state = () => ({
    list: [],
    selected: null,
});

export const mutations = {
    add(state) {
        const id = state.list.length;
        state.list.push(new Category(id));
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
        console.log(props);
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
    update({ commit }, value) {
        commit('update', value);
    },
    select({ commit }, id) {
        commit('select', id);
    },
    rename({ commit }, props) {
        commit('rename', props);
    },
};

export const getters = {
    selected(state) {
        return state.list[state.selected];
    },
};

const colors = [
    'hsla(0, 55%, 45%, 30%)',
    'hsla(334, 60%, 38%, 30%)',
    'hsla(277, 60%, 35%, 30%)',
    'hsla(255, 61%, 39%, 30%)',
    'hsla(233, 57%, 37%, 30%)',
    'hsla(210, 65%, 40%, 30%)',
    'hsla(202, 98%, 47%, 30%)',
    'hsla(185, 100%, 28%, 30%)',
    'hsla(173, 100%, 21%, 30%)',
    'hsla(123, 56%, 35%, 30%)',
    'hsla(95, 69%, 23%, 30%)',
    'hsla(60, 83%, 28%, 30%)',
    'hsla(43, 90%, 46%, 30%)',
    'hsla(34, 80%, 40%, 30%)',
    'hsla(14, 70%, 40%, 30%)',
    'hsla(27, 80%, 27%, 30%)',
    'hsla(11, 36%, 24%, 30%)',
    'hsla(0, 0%, 52%, 30%)',
    'hsla(0, 0%, 38%, 30%)',
    'hsla(0, 0%, 23%, 30%)',
];

class Category {
    constructor(id) {
        this.id = id;
        this.title = `Category ${id}`;
        this.color = colors[id % colors.length];
    }
}
