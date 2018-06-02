const express = require('express');
const router = express.Router();
const slugify = require('slugify');

const elasticsearch = require('elasticsearch');

const fs = require('fs');

const Bluebird = require('bluebird');
const client = new elasticsearch.Client({
  host:'127.0.0.1:9200',
  defer: function () {
    return Bluebird.defer();
  }
});

/*
var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
*/

/**
* kanaouennoù ouzhpennet da ziwezha~n
*/
router.get('/latestSongs', function(req, res, next) {

	client.search({
	  index: 'songs',
	  type: 'song',
	  body: {
	  	"from" : 0, "size" : 3,
	    "sort" : [
	        { "date" : {"order" : "desc"}}
	    ]
		}
	}).then(function (resp) {
	  var resp = formatResponse(resp);
	  res.send(resp);
	}, function (err) {
		return res.send(err);
	  //console.trace(err.message);
	});
})

router.put('/song/edit', function(req, res, next) {
	
	var title = req.body.title;
	var artist = req.body.artist;
	var content = req.body.content;
	var link = req.body.link;
	var id = req.body.id;
	console.log(id);
	console.log(title, artist, link, content);


	var slug = slugify(title);

	client.update({  
	  index: 'songs',
	  type: 'song',
	  id: id,
	  body: {
	  	doc: {
			"title": title,
			"slug": slug,
		    "artist": artist,
		    "link": link,
		    "content": content
	  	}    
	  }
	},function(err,resp,status) {
		console.log(err, resp, status);
	    res.send();																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																										
	});
})

router.put('/song/add', function(req, res, next) {
	
	var title = req.body.title;
	var artist = req.body.artist;
	var content = req.body.content;
	var link = req.body.link;
	var slug = slugify(title);

	console.log(title, artist, link, content);
	client.index({  
	  index: 'songs',
	  type: 'song',
	  body: {
	    "title": title,
	    "slug": slug,
	    "artist": artist,
	   	"link": link,
	    "content": content,
	    "date": new Date()
	  }
	},function(err,resp,status) {
		createArtist(artist);
	    res.send();																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																										
	});
})


function createArtist(artist) {
	client.search({
	  index: 'artists',
	  type: 'artist',
	  body: {
		"query": {
			"term" : { "name" : artist } 
		}
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	    if (hits.length == 0) {
			client.index({
			  index: 'artists',
			  type: 'artists',
			  body: {
			    "name": artist
			  }
			}).then(function (resp) {
				return;
			})
	    } else {
	    	return;
	    }
	}, function (err) {
	    console.trace(err.message);
	});

}

router.get('/findSongsByTitle', function(req, res, next) {

	var title = req.query.term;

	client.search({
	  index: 'songs',
	  type: 'song',
	  body: {
	    query: {
	      match: {
	        title: title
	      }
	    }
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	    res.send(resp);
	}, function (err) {
	    console.trace(err.message);
	});

});

router.get('/findSongsByArtist', function(req, res, next) {
	var artist = req.query.term;

	client.search({
	  index: 'songs',
	  type: 'song',
	  body: {
	    query: {
	      match: {
	        artist: artist
	      }
	    }
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	    res.json(resp);
	}, function (err) {
	    console.trace(err.message);
	});
});

router.get('/autocompleteTitles', function(req, res, next) {
	var content = req.query.term;
	content = content.toLowerCase();

	client.search({
	  index: 'songs',
	  type: 'song',
	  body: {
	    query: {
        "query_string" : {
          "fields" : [
             "title"
          ],
          "query" : content,
          "default_operator" : "AND"
        }
	    }
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	    res.send(resp);
	}, function (err) {
	    console.trace(err.message);
	});

});

router.get('/autocompleteArtists', function(req, res, next) {
	var content = req.query.term;
	content = content.toLowerCase();

	client.search({
	  index: 'songs',
	  type: 'song',
	  body: {
	    query: {
        "query_string" : {
          "fields" : [
             "artist"
          ],
          "query" : content,
          "default_operator" : "AND"
        }
	    }
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	    res.send(resp);
	}, function (err) {
	    console.trace(err.message);
	});

});


router.get('/autocomplete', async function(req, res, next) {
	let content = req.query.term;
	content = content.toLowerCase();


	console.log(content);

	//let resp = await searchSongs(content);
	let resp = await Promise.all([searchSongs(content), searchArtists(content)]);
	console.log(resp);
	res.send(resp);


	/*
	client.search({
		index: 'music',
	  	type: 'songs',
	  	body:{
			"query": {
				"query_string" : {
					"fields" : [
						"title^5",
						"artist^5",
						"content"
					],
					"query" : content,
					"default_operator" : "AND"
				}

			}
		}
	}).then(function (resp) {
	    //var hits = resp.hits.hits;
	    console.log(JSON.stringify(resp));
	    //console.log(JSON.stringify(resp.hits));
	    res.send(resp);
	}, function (err) {
	    console.trace(err.message);
	});
	*/

});


async function searchSongs(content) {
	content = content.trim();
	content = content.replace(/\s/g, " AND ");

	try {
		let response = await client.search({
			index: 'songs',
		  	type: 'song',
		  	body:{
				"query": {
					"query_string" : {
						"fields" : [
							"title^5",
							"artist^5",
							"content"
						],
						"query" : content,
						"default_operator" : "AND"
					}

				}
			}

		})
		console.log(response);
		return response;
	} catch (error) {
    	throw(error);
	}
}

async function searchArtists(content) {

	try {
		let response = await client.search({
			index: 'artists',
			type: 'artist',
			body: {
				query: {
			      match: {
			        "name": content
			      }
			    }
			}
		})
		console.log("artists");
		console.log(JSON.stringify(response));
		return response;
	} catch (error) {
    	throw(error);
	}
}




router.get('/random', function(req, res, next) {

	client.search({
	  index: 'songs',
	  type: 'song',
	  body:{
			"size": 1,
			"query": {
			  "function_score": {
					"functions": [
						{
						  "random_score": {
						  	"seed": Date.now()
						  }
						}
					]
			  }
			}
		}
	}).then(function (resp) {
		resp = formatResponse(resp);
		res.send(resp);
	}, function (err) {
		console.trace(err.message);
	});

})


router.get('/findSongsByTerms', function(req, res, next) {
	var content = req.query.term;

	client.search({
	  index: 'songs',
	  type: 'song',
	  body: {
	    query: {
	      match: {
	        content: content
	      }
	    }
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	    res.send(resp);
	}, function (err) {
	    console.trace(err.message);
	});

});


router.get('/artists/:artistid/songs', function(req, res, next) {
	var artist = req.params.artistid;
	console.log(artist);
	client.search({
	  index: 'songs',
	  type: 'song',
	  body: {
	    query: {
	      term: {
	        "artist.exact": artist
	      }
	    }
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	    var array = [];
	    for (var i = 0 ; i < hits.length ; i++) {
	    	array.push({title: hits[i]._source.title, slug: hits[i]._source.slug});
	    }
	    res.send(array);
	}, function (err) {
	    console.trace(err.message);
	});
})

router.get('/artistsByAlphabet/:letter', function(req, res, next) {
	var letter = req.params.letter.toLowerCase();
	var list = [];


	client.search({
	  index: 'artists',
	  type: 'artist',
	  body: {
	    query: {
    		"prefix" : { "name" : letter }
	    }
	  }
	}).then(function(resp) {
	  var hits = resp.hits.hits;
	  var json = {};
	  json.result = [];
	  for (var i = 0 ; i < hits.length; i++) {
	  	json.result.push(hits[i]._source.name);
	  }

	  json.paginate = {
	  	count : resp.hits.total,
	  	size:10,
	  	page:1
	  }

		res.send(json);
	}, function(err) {
		console.trace(err.message);
	})
/*
	switch(letter){
		case 'A':
		list = ['aro', 'arya', 'argel']
			break;
		case 'B':
			list = ['baro', 'barya', 'bargel','baro', 'barydffda', 'bardfgdfggel','barcvbo', 'barae', 'baezf','barenak', 'bamako', 'bakamol','barot', 'baryat', 'bartgel']
			break;
		default:
			list = ['toto1', 'toto2', 'toto3']
			break;
	}

	var json = {};
	json.result = list;
	json.paginate = {page:1, size:10, count:list.length};
	return res.send(json);
	*/
})

router.get('/song/:songid', function(req, res, next) {
	var slug = req.params.songid;
	//title = title.toLowerCase();
	//console.log(title);
	client.search({
	  index: 'songs',
	  type: 'song',
	  body: {
	    query: {
	      match: {
	        "slug": slug
	      }
	    }
	  }
	}).then(function (resp) {
		resp = formatResponse(resp);
	    res.send(resp);
	}, function (err) {
	    console.trace(err.message);
	});
})

function formatResponse(response) {
	var hits = response.hits.hits;
	let list = [];
	let tmp, id;
	for (var i = 0 ; i < hits.length ; i++) {
		tmp = hits[i]._source;
		id = hits[i]._id;
		list.push({id: id, title: tmp.title, slug: tmp.slug, artist : tmp.artist, content : tmp.content, link: tmp.link});
	}
	return list;
}

module.exports = router;
