const fs = require('fs');
const elasticsearch = require('elasticsearch');
const slugify = require('slugify');


const Bluebird = require('bluebird');
const client = new elasticsearch.Client({
  defer: function () {
    return Bluebird.defer();
  }
});



//init the data in elasticsearch
init();


async function init() {
	let response;
	//delete the index
	try {
		console.log("deleting index");
		response = 	await deleteIndex();  
	} catch (err) {
		console.log('elasticsearch error while deleting index', err);
	}

	//create the index, the mapping and add the data
	try {
		console.log("creating index");
		response = 	await createIndex();  
		console.log("mapping data");
		response = 	await addMapping();  
		addSongs();
	} catch (err) {
		console.log('elasticsearch error', err);
	}
}


//Diverkañ an index
async function deleteIndex() { 
	return await client.indices.delete({
	    index: "music"
	});		    
}


//ouzhpennañ ar mapping
async function addMapping() {
  return await client.indices.putMapping({
    index: 'music',
    type: 'songs',
    body: {
      "properties": {
        "title": {
          "type": "text",
          "analyzer": "my_analyzer",
          "fields": {
            "exact": { 
              "type":  "keyword"
            }
          }
        },
        "slug": {
          "type": "text",
          "analyzer": "keyword"
        },
        "artist": {
          "type": "text",
          "analyzer": "my_analyzer",
          "fields": {
			"exact": { 
				"type":  "keyword"
		  	}
		  }
        },
        "content": {
          "type": "text",
          "analyzer": "my_analyzer"
        }
      }
    }
  });
}


//Krouiñ an index
async function createIndex() {
    var settings = {
        "analysis": {
          "analyzer": {
            "my_analyzer": {
              "tokenizer": "my_tokenizer",
                "filter": [
                  "lowercase"
                ]
            }
          },
          "tokenizer": {
            "my_tokenizer": {
              "type": "ngram",
              "min_gram": 2,
              "max_gram": 10,
              "token_chars": [
                "letter",
                "digit",
                "punctuation"
              ]
            }
          }
        }
      }
    
    return await client.indices.create({
        index: 'music',
        body: {
            settings: settings
        }
    });
}


/*

client.bulk({
  body: [
    // action description
    { index:  { _index: 'music', _type: 'artists'} },
     // the document to index
    { name: 'Denez Prigent' },
    { index:  { _index: 'music', _type: 'artists'} },
     // the document to index
    { name: 'Denez Abernot' },
    { index:  { _index: 'music', _type: 'artists'} },
     // the document to index
    { name: 'Marion Arnaud' }    
  ]
}, function (err, resp) {
  // ...
});
*/




//Ouzhpennañ ar c'hananouennoù
function addSongs() {
  let text = '';

  text = fs.readFileSync('./kanaouennoù/peskig.txt', "utf8");
  client.index({  
    index: 'music',
    type: 'songs',
    body: {
      "title": "Peskig arc'hant",
      "slug": slugify("Peskig arc'hant"),
      "artist": "Naig Rozmor",
      "content": text,
      "date": new Date()
    }
  },function(err,resp,status) {
      console.log(resp);
  });


  text = fs.readFileSync('./kanaouennoù/landelo.txt', "utf8");

  client.index({  
    index: 'music',
    type: 'songs',
    body: {
      "title": "Plac'h landelo",
      "slug": slugify("Plac'h landelo"),
      "artist": "Denez Prigent",
      "content": text,
      "date": new Date()
    }
  },function(err,resp,status) {
      console.log(resp);
  });

  text = fs.readFileSync('./kanaouennoù/bejinerien.txt', "utf8");
  client.index({  
    index: 'music',
    type: 'songs',
    body: {
      "title": "Gwerz Ar Vezhinerien",
      "slug": slugify("Gwerz Ar Vezhinerien"),
      "artist": "Denez Abernot",
      "content": text,
      "date": new Date()
    }
  },function(err,resp,status) {
      console.log(resp);
  });



  text = fs.readFileSync('./kanaouennoù/anhiniagaran.txt', "utf8");
  client.index({  
    index: 'music',
    type: 'songs',
    body: {
      "title": "An Hini A Garan",
      "slug": slugify("An Hini A Garan"),
      "artist": "Denez Prigent",
      "content": text,
      "date": new Date()
    }
  },function(err,resp,status) {
      console.log(resp);
  });


}

