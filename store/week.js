import { setMinutes, setHours } from 'date-fns';

export const state = () => ({
    slots() {
        const stops = this.stops();
        const slots = [];

        for (let i = 0; i < stops.length; i += 1) {
            const current = stops[i];
            const next = stops[i + 1];
            if (!next) break;

            const [currH, currM] = current.split(':');
            const [nextH, nextM] = next.split(':');

            slots.push({
                start: setHours(setMinutes(new Date(0), currM), currH),
                end: setHours(setMinutes(new Date(0), nextM), nextH),
            });
        }

        // // First slot
        // const [firstHours, firstMinutes] = this.stops[0].split(':');
        // slots.unshift({
        //     start: setHours(new Date(0), 0),
        //     end: setHours(
        //         setMinutes(new Date(0), firstMinutes),
        //         firstHours
        //     ),
        // });

        // Last slot
        // const [lastHours, lastMinutes] =
        //     this.stops[this.stops.length - 1].split(':');
        // slots.push({
        //     start: setHours(
        //         setMinutes(new Date(0), lastMinutes),
        //         lastHours
        //     ),
        //     end: addDays(setHours(setMinutes(new Date(0), 0), 0), 1),
        // });

        return slots;
    },
    stops() {
        const temp = [
            new Array(25)
                .fill(0)
                .map((_, i) => `${i.toString().padStart(2, '0')}:00`),
            [
                '09:00',
                '10:30',
                '10:45',
                '12:15',
                '13:45',
                '15:15',
                '15:30',
                '17:00',
            ],
        ];

        const stops = temp[1];

        return stops;
    },
});

// export const mutations = {
//     select: (state, name) => {
//         state.selected = name;
//     },
// };

// export const actions = {
//     select({ commit }, name) {
//         commit('select', name);
//     },
// };

export const getters = {
    slots(state) {
        return state.slots();
    },
};
