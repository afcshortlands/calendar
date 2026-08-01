import path from 'node:path';
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'url';
import crypto from "node:crypto";

import ical from "node-ical";

function getConfig(args) {
    const { values, positionals: feeds } = parseArgs({
        args,
        options: {
            env: { type: 'string', short: 'e', default: 'CALENDAR_FEEDS' },
        },
        allowPositionals: true
    });
    return {...values, feeds};
}

const config = getConfig();

if (config.feeds.length === 1 && config.feeds[0].startsWith("@")) {
    const filePointer = config.feeds.pop().substring(1);
    const fileContent = readFileSync(filePointer, 'utf-8');
    config.feeds.push(...fileContent.split(/[\s,]+/));
} else if (!config.feeds.length) {
    const {env} = config;
    config.feeds.push(...(process.env[env] ?? "").split(/[\s,]+/));
}

const feeds = Array.from(
    new Set(config.feeds.filter(Boolean)),
    url => ical.fromURL(url).then(data => [
        url,
        crypto.createHash("md5").update(url).digest("hex").substring(0, 8),
        data
    ])
);

function formatEvent(calendarId, event) {
    if (!event) return;

    const {start, end, summary, datetype, description} = event;
    const id = crypto.createHash("md5")
        .update(calendarId)
        .update(start.toISOString())
        .update(end.toISOString())
        .digest("hex").substring(0, 8);
    return {start, end, summary, datetype, description, id};
}

Promise.all(feeds).then(async (calendars) => {
    const rsp = {
        calendars: {},
        dates: {},
        events: {},
    };

    calendars.forEach(([url, calendarId, {vcalendar, ...events}]) => {
        const name = vcalendar.name ?? vcalendar['WR-CALNAME'];
        const desc = vcalendar.description ?? vcalendar['WR-CALDESC'] ?? name;
        const tz = vcalendar.timezone ?? vcalendar['WR-TIMEZONE'];
        const calendar = {url, calendarId, name, desc, tz, events: []};
        rsp.calendars[calendarId] = calendar;

        Object.values(events).flatMap(({type, ...data}) => {
            if (type !== 'VEVENT') return [];

            if (data.rrule) {
                return ical.expandRecurringEvent(data, {
                    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    to: new Date(Date.now() + 4 * 31 * 24 * 60 * 60 * 1000)
                }).map(event => formatEvent(calendarId, {...event.event, ...event}));
            } else {
                return formatEvent(calendarId, data);
            }
        }).forEach((event) => {
            if (event) {
                const [date, time] = event.start.toISOString().split('T', 2);
                calendar.events.push(event.id);
                rsp.dates[date] ??= [];
                rsp.dates[date].push(event.id);
                rsp.events[event.id] = event;
            }
        });
    });

    return rsp;
}).then(async (rsp) => {
    console.log(JSON.stringify(rsp, null, 2));
});;
