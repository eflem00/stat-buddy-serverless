const elasticsearch = require('elasticsearch');
const es = new elasticsearch.Client({
  host: 'localhost:9200'
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


