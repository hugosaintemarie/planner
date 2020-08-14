import calendars from './calendars';
import events from './events';
import ui from './ui';

export default {
    loading: false,
    loaded: false,

    init() {
        this.load();
    },
    
    load() {
        this.loading = true;
        let data = localStorage.getItem('data');
        if (!data) return;

        data = JSON.parse(data);

        ui.changeTool(data.selectedTool);

        calendars.getStartEnd();

        // Add events
        for (const event of data.events.sort((a, b) => a.order < b.order ? -1 : 1)) events.newEvent(event);
        
        // Add calendars
        for (const calendar of data.calendars.sort((a, b) => a.order < b.order ? -1 : 1)) calendars.newCalendar(calendar);

        calendars.selectCalendar($(`.calendars-wrap .calendar[data-id="${data.selectedCalendar}"]`));

        // Save current ids
        calendars.calendarID = Math.max(...data.calendars.map(c => c.id));
        events.eventID = Math.max(...data.calendars.map(c => c.events.map(e => e.id)).flat());

        this.loading = false;
        this.loaded = true;
    },

    save(manual = false) {
        if (this.loading) return;

        const data = {
            events: [...events.data],
            calendars: [...calendars.data],
            selectedCalendar: calendars.selected,
            selectedTool: ui.tool
        }

        if (manual) {
            // TODO: display message to explain auto-save
        }

        localStorage.setItem('data', JSON.stringify(data));

        // Prevent default browser save window (Cmd + S)
        return false;
    }
}