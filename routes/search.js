var express = require('express');
var router = express.Router();
var slugify = require('slugify');

var elasticsearch = require('elasticsearch');

var fs = require('fs');

var Bluebird = require('bluebird');
var client = new elasticsearch.Client({
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
	  index: 'music',
	  type: 'songs',
	  body: {
	  	"from" : 0, "size" : 3,
	    "sort" : [
	        { "date" : {"order" : "desc"}}
	    ]
		}
	}).then(function (resp) {
	  var hits = resp.hits.hits;
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
	  index: 'music',
	  type: 'songs',
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
	  index: 'music',
	  type: 'songs',
	  body: {
	    "title": title,
	    "slug": slug,
	    "artist": artist,
	   	"link": link,
	    "content": content,
	    "date": new Date()
	  }
	},function(err,resp,status) {
	    res.send();																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																										
	});


})

router.get('/findSongsByTitle', function(req, res, next) {

	var title = req.query.term;

	client.search({
	  index: 'music',
	  type: 'songs',
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

/* GET users listing. */
router.get('/findSongsByArtist', function(req, res, next) {
	var artist = req.query.term;

	client.search({
	  index: 'music',
	  type: 'songs',
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
	  index: 'music',
	  type: 'songs',
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


router.get('/autocomplete2', function(req, res, next) {
	var content = req.query.term;
	content = content.toLowerCase();

	console.log(content);

	client.search({
	  index: 'music',
	  type: 'songs',
	  body:{
			  "query": {
			  	/*
			    "multi_match" : {
			      "query":    content, 
			      "fields": [ "title", "artist","content"] 
			    }
			    */
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
			  /*
			  ,
			  "highlight": {
            "fields" : {
                "title" : {},
                //"title": { "fragment_size" :content.length},
                "artist": {},
                "content": {}

            }
        }*/
			}

	}).then(function (resp) {
	    //var hits = resp.hits.hits;
	    console.log(JSON.stringify(resp.hits));
	    res.send(resp);
	}, function (err) {
	    console.trace(err.message);
	});

});

router.get('/random', function(req, res, next) {

	client.search({
	  index: 'music',
	  type: 'songs',
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
		console.log(resp);
    var hits = resp.hits.hits;
    res.send(resp);
	}, function (err) {
		console.trace(err.message);
	});

})

/*

curl -XGET 'localhost:9200/_search?pretty' -H 'Content-Type: application/json' -d'
{
  "query": {
    "multi_match" : {
      "query":    "Denez peskig", 
      "fields": [ "title", "artist" ] 
    }
  },
  "highlight": {
            "fields" : {
                "title" : {},
                 "artist": {}
            }
        }

}
'

*/




/* GET users listing. */
router.get('/findSongsByTerms', function(req, res, next) {
	var content = req.query.term;

	client.search({
	  index: 'music',
	  type: 'songs',
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
	client.search({
	  index: 'music',
	  type: 'songs',
	  body: {
	    query: {
	      match: {
	        artist: artist
	      }
	    }
	  }
	}).then(function (resp) {
	    var hits = resp.hits.hits;
	    var array = [];
	    for (var i = 0 ; i < hits.length ; i++) {
	    	array.push(hits[i]._source.title);
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
	  index: 'music',
	  type: 'artists',
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
	  index: 'music',
	  type: 'songs',
	  body: {
	    query: {
	      match: {
	        "slug": slug
	      }
	    }
	  }
	}).then(function (resp) {
			console.log(resp);
	    var hits = resp.hits.hits;
	    res.send(resp);
	}, function (err) {
	    console.trace(err.message);
	});
})

module.exports = router;
