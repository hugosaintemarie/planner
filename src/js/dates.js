export default {
    init() {
        Date.prototype.getWeek = function (dowOffset = 1) {
            const newYear = new Date(this.getFullYear(), 0, 1);
            let day = newYear.getDay() - dowOffset;
            day = (day >= 0 ? day : day + 7);
            const daynum = Math.floor((this.getTime() - newYear.getTime() - 
            (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
            
            let weeknum;
            if (day < 4) {
                weeknum = Math.floor((daynum + day - 1) / 7) + 1;
                if (weeknum > 52) {
                    const nYear = new Date(this.getFullYear() + 1, 0, 1);
                    let nday = nYear.getDay() - dowOffset;
                    nday = nday >= 0 ? nday : nday + 7;
                    weeknum = nday < 4 ? 1 : 53;
                }
            } else {
                weeknum = Math.floor((daynum + day - 1) / 7);
            }
            return weeknum;
        };
    },

    toString(date) {
        return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
    },

    isInArray(arr, date) {
        return arr.some(d => this.toString(d) === this.toString(date));
    },

    isInRange(start, end, date) {
        return this.isInArray(this.range(start, end), date);
    },

    relativeDate(date, n) {
        return new Date(new Date(date).setDate(new Date(date).getDate() + n));
    },

    relativeFirstWeekDay(date) {
        return new Date(new Date(date).setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1)));
    },

    relativeLastWeekDay(date) {
        return new Date(new Date(date).setDate(date.getDay() === 0 ? date.getDate() : (date.getDate() + 7 - date.getDay())))
    },

    // Build array of all days from start to end
    range(start, end) {
        const days = [new Date(start)];
        while (days[days.length - 1] < new Date(end)) days.push(new Date(new Date(days[days.length - 1].valueOf()).setDate(days[days.length - 1].getDate() + 1)));
        return days;
    },

    findLowestWeekDay(arr) {
        return Math.min(...arr.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
    },

    findHighestWeekDay(arr) {
        return Math.max(...arr.map(d => d.getDay()).map(w => w === 0 ? 7 : w));
    },

    toWeeksArray(days) {
        const weeks = days.reduce((acc, curr) => {
            if (!acc.length) {
                acc = [[curr]];
            } else {
                const lastWeek = acc[acc.length - 1];

                if (curr.getWeek() === lastWeek[lastWeek.length - 1].getWeek() || curr.getWeek() === 0) lastWeek.push(curr);
                else acc.push([curr]);
            }

            return acc;
        }, []);
        
        return weeks;
    },

    delta(date1, date2) {
        return Math.ceil((new Date(date2) - new Date(date1)) / (1000 * 60 * 60 * 24)); 
    }
}