const fs = require('fs');
const converter = require('json-2-csv');

const url =
	'https://www.usnews.com/best-colleges/api/search?_sort=schoolName&_sortDirection=asc&_page=1';

const HEADERS = {
	'User-Agent':
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:67.0) Gecko/20100101 Firefox/67.0'
};

const fetchData = async (url) => {
	console.log(`Crawling data from -- ${url}`);
	let response = await fetch(url);
	if (response.ok === false) {
		console.log(`Error occurred while fetching data`);
		return;
	}

	const result = await response.json();
	return result;
};

getUntilEof = async () => {
	let universities = [];
	let urlPage = url;
	while (urlPage?.length > 0) {
		const resJson = await fetchData(urlPage);
		console.log(35, resJson);
		const data = resJson['data'];
		if (!(data === null || data === undefined)) {
			const pageUniversities = data['items']
				.filter(
					(university) =>
						university['institution']['isPublic'] === true &&
						university['institution']['rankingSortRank'] !==
							'Unranked' &&
						university['institution']['rankingDisplayRank'] !==
							'Unranked' &&
						university['institution'][
							'institutionalControl'
						].toLowerCase() === 'public'
				)
				.map((unversity) => unversity['institution']);
			universities = [...universities, ...pageUniversities];
			urlPage = resJson['meta']['rel_next_page_url'];
		}
	}
	try {
		universities.sort(
			(a, b) => a['rankingSortRank'] - b['rankingSortRank']
		);
		const csv = await converter.json2csv(universities);
		fs.writeFileSync('./universities.csv', csv);
	} catch (err) {
		console.error(err);
	}
};

getUntilEof().then((x) => {
	console.log('done!');
});
