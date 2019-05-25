const elasticsearch = require('elasticsearch');
const es = new elasticsearch.Client({
  host: 'https://search-stat-buddy-es-xt44xcxdvppcdg4dgsspz7lh5q.us-west-2.es.amazonaws.com/'
});
const _index = 'events';
const _type = 'event';
const _size = 1000;

async function query () {
	try{
		const results = await es.search({
		  index: _index,
		  type: _type,
		  size: _size,
		  body: {
			query: {
			  match: {
				game_pk: 2016020559
			  }
			}
		  }
		});

		for (const event of results.hits.hits)
			console.log(JSON.stringify(event, null, 4));

		console.log(results.hits.hits.length);

		const indeces = await es.cat.indices({v: true});
		console.log(indeces);

	} catch(ex) {
		console.log('error:', ex);
	}
}

query();


