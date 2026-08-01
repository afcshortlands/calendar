import { ICalCalendar, ICalCalendarMethod } from 'ical-generator';

class ICal {
	data() {
		return {
            pagination: {
                data: "calendar.calendars",
                size: 1,
                before: (data, {calendar: {events, calendars}}) => {
                    return [
                        {
                            id: 'calendar',
                            name: 'All Pitches',
                            tz: 'Europe/London',
                            events: Object.keys(events),
                        },
                        ...data.map(id => calendars[id]),
                    ];
                }
            },
			permalink: ({pagination}) => {
                return `/${ pagination.items[0].id }.ics`;
            },
		};
	}

	render({pagination, page, calendar}) {
        const [{name, id, events}] = pagination.items;

        const cal = new ICalCalendar({
			name,
			prodId: {
				company: "AFC Shortlands Pitches",
				product: name
			},
			url: `https://calendar.afcshortlands.com${ page.url }`,
			method: ICalCalendarMethod.PUBLISH
		});

        events.forEach(eventId => {
            const event = calendar.events[eventId];
            cal.createEvent({
                start: new Date(event.start),
                end: new Date(event.end),
                summary: event.summary,
                description: event.description,
                location: calendar.calendars[event.calendarId].name
            });
        })

		return cal.toString();
	}
}

export default ICal;