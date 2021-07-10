const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                gray: colors.gray,
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
