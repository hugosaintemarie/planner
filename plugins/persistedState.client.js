import createPersistedState from 'vuex-persistedstate';

export default ({ store }) => {
    createPersistedState({
        key: 'vuex',
        storage: window.localStorage,
        paths: ['views', 'tools'],
    })(store);
};
