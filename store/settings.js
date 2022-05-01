export const state = () => ({
    settings: {
        start: '2021-11-01',
        end: '2021-12-31',
    },
});

export const getters = {
    get: (state) => (prop) => {
        return state.settings[prop];
    },
};
