var fs = require('fs');
var elasticsearch = require('elasticsearch');

var Bluebird = require('bluebird');
var client = new elasticsearch.Client({
  defer: function () {
    return Bluebird.defer();
  }
});

var text = '';





/*
client.search({
    index: 'music',
    type: 'songs',
    body:{
        "query": {
          "query_string" : {
            "fields" : [
               "title",
               "artist",
               "content"
            ],
            "query" : "an hini a garan",
            "default_operator" : "AND"
         }
        }
      }
  }).then(function (resp) {
    console.log(JSON.stringify(resp));
      //var hits = resp.hits.hits;
      //res.send(resp);
  }, function (err) {
      console.trace(err.message);
  });
*/



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
    console.log(JSON.stringify(resp));
      //var hits = resp.hits.hits;
      //res.send(resp);
  }, function (err) {
      console.trace(err.message);
  });














//deleteIndex();
//createIndex();
//addMappingForTitles();
//addMappingForArtists();
//addSongs();



//ouzhpenna~n ar mapping
function addMappingForTitles() {
  client.indices.putMapping({
    index: 'music',
    type: 'songs',
    body: {
      "properties": {
        "title": {
          "type": "text",
          "analyzer": "my_analyzer",
          "search_analyzer": "whitespace"
        }
      }
    }
  })
}

//ouzhpenna~n ar mapping
function addMappingForArtists() {
  client.indices.putMapping({
    index: 'music',
    type: 'songs',
    body: {
      "properties": {
        "title": {
          "type": "text",
          "analyzer": "my_analyzer",
          "search_analyzer": "whitespace"
        },
        "artist": {
          "type": "text",
          "analyzer": "my_analyzer",
          "search_analyzer": "whitespace"
        },
        "content": {
          "type": "text",
          "analyzer": "my_analyzer",
          "search_analyzer": "whitespace"
        }
      }
    }
  })
}



    
//Diverka~n an index
function deleteIndex() {  
    return client.indices.delete({
        index: "music"
    });
}


//Kroui~n an index
function createIndex() {
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
                "digit"
              ]
            }
          }
        }
      }
    
    return client.indices.create({
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




//Ouzhpenna~n ar c'hananouennoù
function addSongs() {
  text = fs.readFileSync('./kanaouennoù/peskig.txt', "utf8");
  client.index({  
    index: 'music',
    type: 'songs',
    body: {
      "title": "Peskig arc'hant",
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
      "artist": "Denez Prigent",
      "content": text,
      "date": new Date()
    }
  },function(err,resp,status) {
      console.log(resp);
  });





}

