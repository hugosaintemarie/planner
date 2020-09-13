import calendars from './calendars';
import events from './events';
import toast from './toast';
import ui from './ui';

export default {
    loading: false,
    loaded: false,

    init() {
        let data = localStorage.getItem('data');
        if (!data) return;

        data = JSON.parse(data);
        this.load(data);
    },
    
    load(data) {
        this.loading = true;

        ui.changeTool(data.selectedTool);
        if (data.view === 'linear') ui.linearView();

        if (data.start) $('#start').val(data.start);
        if (data.end) $('#end').val(data.end);

        calendars.getStartEnd();
        calendars.buildCalendarHead();

        // Add events
        for (const event of data.events.sort((a, b) => a.order < b.order ? -1 : 1)) events.newEvent(event);
        
        // Add calendars
        for (const calendar of data.calendars.sort((a, b) => a.order < b.order ? -1 : 1)) calendars.newCalendar(calendar);

        calendars.selectCalendar($(`.calendars-wrap .calendar[data-id="${data.selectedCalendar}"]`));

        // Save current ids
        calendars.calendarID = Math.max(...data.calendars.map(c => c.id), -1);
        events.eventID = Math.max(...data.calendars.map(c => c.events.map(e => e.id)).flat(), -1);

        // Hide days if necessary
        if (data.daysShown) for (const [day, show] of data.daysShown.entries()) {
            if (!show) ui.showHideWeekday(day, show);
        }

        this.loading = false;
        this.loaded = true;
    },

    save(manual = false) {
        // Prevent saving while loading
        if (this.loading) return false;

        const data = this.getData();
        localStorage.setItem('data', JSON.stringify(data));

        if (manual) {
            toast.show('Saved!<br><span class="small">Planner autosaves your work ✨</span>');

            // Prevent default browser save window (Cmd + S)
            return false;
        }
    },

    getData() {
        const data = {
            start: $('#start').val(),
            end: $('#end').val(),
            events: [...events.data],
            calendars: [...calendars.data],
            selectedCalendar: calendars.selected,
            selectedTool: ui.tool,
            view: ui.view,
            daysShown: ui.daysShown
        };

        return data;
    },

    clear() {
        // For development purposes only
        localStorage.removeItem('data');
    },

    download() {
        const data = this.getData();
        const a = document.createElement('a');
        a.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
        a.download = 'project.planner';
        a.click();
    },

    open() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.planner';
        input.addEventListener('change', e => {
            const file = e.target.files[0];
            
            const reader = new FileReader();
            reader.addEventListener('load', _e => {
                const result = _e.target.result;
                const data = JSON.parse(result);
                this.reset();
                this.load(data);
                this.save();
                
                $('header ul li.open').removeClass('open');
            });

            reader.readAsText(file);
        });

        input.click();
    },

    reset() {
        events.reset();
        calendars.reset();
    }
}