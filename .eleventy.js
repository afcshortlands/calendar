export default async function (eleventy) {
    const config = {
		templateFormats: ['html', '11ty.js'],
        markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		passthroughFileCopy: true,
		dir: {
			input: 'src/site',
			output: 'dist',
			includes: '../layouts/includes',
            modules: '../layouts/modules',
			layouts: '../layouts',
			data: '../data'
		}
	};

    eleventy.addFilter("isNext", function(datestring) {
        const ref = new Date(datestring);
        const now = new Date(new Date().setHours(0, 0, 0, 0));
        return ref >= now;
    });

    eleventy.addFilter("toDate", function(datestring) {
        return new Date(datestring);
    });

    eleventy.addFilter("intersect", function(a, b) {
        const _a = new Set(a);
        const _b = new Set(b);
        return Array.from(_a.intersection(_b));
    });

    eleventy.addFilter("hydrate", function(ids, data) {
        return ids.map(id => data[id]);
    });

    eleventy.addFilter("datestring", function(date, _options, locale = "en-GB") {
        const options = {
            timeZone: "Europe/London",
            ...(_options || {
                day: "numeric",
                month: "numeric",
                year: "numeric",
            }),
        };

        return date.toLocaleDateString(locale, options);
    });
    
    eleventy.addFilter("timestring", function(date, _options, locale = "en-GB") {
        const options = {
            timeZone: "Europe/London",
            ...(_options || {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        return new Date(Date.parse(date)).toLocaleTimeString(locale, options);
    });

    eleventy.addFilter("inBlock", function({start, summary}, hour) {
        const eventHour = new Date(Date.parse(start)).getHours();
        const valid = (eventHour >= hour && eventHour < (hour + 1));
        return valid;
    });

    eleventy.addFilter("offset", function({start}) {
        const eventMinute = new Date(Date.parse(start)).getMinutes();
        return 100 / 60 * eventMinute;
    });

    eleventy.addFilter("height", function({start, end}) {
        const duration = new Date(Date.parse(end) - Date.parse(start));
        const length = duration.getUTCHours() * 60 + duration.getUTCMinutes();
        return 100 / 60 * length;
    });

    return config;
}