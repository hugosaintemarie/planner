import calendars from './calendars';
import categories from './categories';
import events from './events';
import toast from './toast';
import ui from './ui';

export default {
    loading: false,
    loaded: false,

    init() {
        let data = localStorage.getItem('data');
        if (!data) return;

        try {
            this.load(JSON.parse(data));
        } catch (err) {
            console.error(err);
        }
    },
    
    load(data) {
        this.loading = true;

        ui.changeTool(data.ui.selectedTool);
        if (data.ui.view === 'linear') ui.linearView();

        if (data.settings.start) $('#start').val(data.settings.start);
        if (data.settings.end) $('#end').val(data.settings.end);

        console.log(data);

        calendars.getStartEnd();
        calendars.buildCalendarHead();

        // Add calendars
        for (const calendar of Object.values(data.calendars).sort((a, b) => a.order < b.order ? -1 : 1)) calendars.build(calendar);

        // Add categories
        for (const category of Object.values(data.categories).sort((a, b) => a.order < b.order ? -1 : 1)) categories.build(category);

        // Add events
        for (const event of Object.values(data.events)) events.build(event);

        // Save current ids
        calendars.id = Math.max(...Object.keys(data.calendars));
        categories.id = Math.max(...Object.keys(data.categories));
        events.id = Math.max(...Object.keys(data.events));

        // Select selected calendar
        calendars.selectCalendar($(`.calendars-wrap .calendar[data-id="${data.ui.selectedCalendar}"]`));

        // Hide days if necessary
        if (data.ui.daysShown) for (const [day, show] of data.ui.daysShown.entries()) {
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
            calendars: calendars.list,
            categories: categories.list,
            events: events.list,
            ui: {
                view: ui.view,
                selectedTool: ui.tool,
                selectedCalendar: calendars.selected,
                daysShown: ui.daysShown
            },
            settings: {
                start: $('#start').val(),
                end: $('#end').val()
            }
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
        calendars.reset();
        categories.reset();
        events.reset();
    }
}