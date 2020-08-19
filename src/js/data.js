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
        
        if (!data) {
            this.loading = false;
            return;
        }

        data = JSON.parse(data);

        ui.changeTool(data.selectedTool);
        if (data.view === 'linear') ui.linearView();

        if (data.start) $('#start').val(data.start);
        if (data.end) $('#end').val(data.end);

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
        // Prevent saving while loading
        if (this.loading) return false;

        const data = {
            start: $('#start').val(),
            end: $('#end').val(),
            events: [...events.data],
            calendars: [...calendars.data],
            selectedCalendar: calendars.selected,
            selectedTool: ui.tool,
            view: ui.view
        }

        if (manual) {
            // TODO: display message to explain auto-save
        }

        localStorage.setItem('data', JSON.stringify(data));

        // Prevent default browser save window (Cmd + S)
        return false;
    },

    clear() {
        // For development purposes only
        localStorage.removeItem('data');
    }
}