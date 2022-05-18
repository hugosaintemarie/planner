export const state = () => ({
    list: [],
    selected: null,
});

export const mutations = {
    add(state, title) {
        const id = state.list.length;
        state.list.push(new Category(id, title));
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
    add({ commit }, title) {
        commit('add', title);
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
    all(state) {
        return state.list;
    },
    selected(state) {
        return state.list[state.selected];
    },
    default(state) {
        return state.list[0];
    },
    get: (state) => (id) => {
        return state.list.find((item) => item.id === id);
    },
    newest(state) {
        return state.list.slice(-1)[0];
    },
    findByTitle: (state) => (title) => {
        return state.list.find((d) => d.title === title);
    },
};

const colors = [
    'hsl(0, 55%, 45%)',
    'hsl(334, 60%, 38%)',
    'hsl(277, 60%, 35%)',
    'hsl(255, 61%, 39%)',
    'hsl(233, 57%, 37%)',
    'hsl(210, 65%, 40%)',
    'hsl(202, 98%, 47%)',
    'hsl(185, 100%, 28%)',
    'hsl(173, 100%, 21%)',
    'hsl(123, 56%, 35%)',
    'hsl(95, 69%, 23%)',
    'hsl(60, 83%, 28%)',
    'hsl(43, 90%, 46%)',
    'hsl(34, 80%, 40%)',
    'hsl(14, 70%, 40%)',
    'hsl(27, 80%, 27%)',
    'hsl(11, 36%, 24%)',
    'hsl(0, 0%, 52%)',
    'hsl(0, 0%, 38%)',
    'hsl(0, 0%, 23%)',
];

const bgColors = [
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

const textColors = [
    'hsl(0, 100%, 85%)',
    'hsl(334, 100%, 85%)',
    'hsl(277, 100%, 85%)',
    'hsl(255, 100%, 85%)',
    'hsl(233, 100%, 85%)',
    'hsl(210, 100%, 85%)',
    'hsl(202, 100%, 85%)',
    'hsl(185, 100%, 85%)',
    'hsl(173, 100%, 85%)',
    'hsl(123, 100%, 85%)',
    'hsl(95, 100%, 85%)',
    'hsl(60, 100%, 85%)',
    'hsl(43, 100%, 85%)',
    'hsl(34, 100%, 85%)',
    'hsl(14, 100%, 85%)',
    'hsl(27, 100%, 85%)',
    'hsl(11, 100%, 85%)',
    'hsl(0, 0%, 85%)',
    'hsl(0, 0%, 85%)',
    'hsl(0, 0%, 85%)',
];

class Category {
    constructor(id, title) {
        this.id = id;
        this.title = title || 'New event';
        this.color = colors[(title ? id : 18) % colors.length];
        this.bgColor = bgColors[(title ? id : 18) % bgColors.length];
        this.textColor = textColors[(title ? id : 18) % textColors.length];
    }
}
