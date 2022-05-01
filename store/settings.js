export const state = () => ({
    settings: {
        start: '2022-04-01',
        end: '2022-05-30',
    },
});

export const getters = {
    get: (state) => (prop) => {
        return state.settings[prop];
    },
};
