# Partial matching

DELETE my_index

PUT my_index
{
  "mappings": {
    "properties": {
      "postcode": {
        "type": "keyword"
      }
    }
  }
}

POST my_index/_bulk
{"index": {"_id": 1}}
{"postcode": "W1V 3DG"}
{"index": {"_id": 2}}
{"postcode": "W2F 8HW"}
{"index": {"_id": 3}}
{"postcode": "W1F 7HW"}
{"index": {"_id": 4}}
{"postcode": "WC1N 1LZ"}
{"index": {"_id": 5}}
{"postcode": "SW5 0BE"}

GET my_index/_search
{
  "query": {
    "prefix": {
      "postcode": {
        "value": "W1"
      }
    }
  }
}

GET my_index/_search
{
  "query": {
    "wildcard": {
      "postcode": {
        "value": "W?F*HW"
      }
    }
  }
}

GET my_index/_search
{
  "query": {
    "regexp": {
      "postcode": {
        "value": "W[0-9].+"
      }
    }
  }
}

# Query-Time Search-as-You-Type
PUT booze
{
  "mappings": {
    "properties": {
      "brand": {
        "type": "text"
      }
    }
  }
}

POST booze/_bulk
{"index": {"_id": 1}}
{"brand": "Jhonnie Walker Black Label"}
{"index": {"_id": 2}}
{"brand": "Jhonnie Walker Blue Label"}

GET booze/_validate/query?rewrite=true
{
  "query": {
    "match_phrase_prefix": {
      "brand": "jhonnie walker bl"
    }
  }
}

# index-Time Search-as-You-Type
DELETE my_index
PUT my_index
{
  "settings": {
    "number_of_shards": 1,
    "analysis": {
      "filter": {
        "autocomplete_filter": {
          "type": "edge_ngram",
          "min_gram": 1,
          "max_gram": 20
        }
      },
      "analyzer": {
        "autocomplete": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "autocomplete_filter"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "autocomplete",
  "text": [
    "quick brown"
  ]
}

PUT my_index/_mapping
{
  "properties": {
    "name": {
      "type": "text",
      "analyzer": "autocomplete"
    }
  }
}

POST my_index/_bulk
{"index": {"_id": 1}}
{"name": "Brown foxes"}
{"index": {"_id": 2}}
{"name": "Yellow furballs"}


GET my_index/_search
{
  "query": {
    "match": {
      "name": "brown fo"
    }
  }
}

GET my_index/_validate/query?explain
{
  "query": {
    "match": {
      "name": "brown fo"
    }
  }
}


GET my_index/_search
{
  "query": {
    "match": {
      "name": {
        "query": "brown fo",
        "analyzer": "standard"
      }
    }
  }
}

PUT my_index/_mapping
{
  "properties": {
    "name": {
      "type": "text",
      "analyzer": "autocomplete",
      "search_analyzer": "standard"
    }
  }
}

GET my_index/_validate/query?explain
{
  "query": {
    "match": {
      "name": "brown fo"
    }
  }
}

# Edge n-grams and Postcodes
DELETE my_index

PUT my_index
{
  "settings": {
    "analysis": {
      "filter": {
        "postcode_filter" : {
          "type": "edge_ngram",
          "min_gram": 1,
          "max_gram": 8
        }
      }, 
      "analyzer": {
        "postcode_index": {
          "tokenizer": "keyword",
          "filter": ["postcode_filter"]
        },
        "postcode_search": {
          "tokenizer": "keyword"
        }
      }
    }
  }, 
  "mappings": {
    "properties": {
      "postcode": {
        "type": "text",
        "analyzer": "postcode_index",
        "search_analyzer": "postcode_search"
      }
    }
  }
}

POST my_index/_bulk
{"index": {"_id": 1}}
{"postcode": "W1V 3DG"}
{"index": {"_id": 2}}
{"postcode": "W2F 8HW"}
{"index": {"_id": 3}}
{"postcode": "W1F 7HW"}
{"index": {"_id": 4}}
{"postcode": "WC1N 1LZ"}
{"index": {"_id": 5}}
{"postcode": "SW5 0BE"}

POST my_index/_analyze
{
  "analyzer": "postcode_index",
  "text": "WC1N 1LZ"
}

POST my_index/_analyze
{
  "analyzer": "postcode_search",
  "text": "WC1N 1LZ"
}

GET my_index/_search
{
  "query": {
    "match": {
      "postcode": {
        "query": "W1"
      }
    }
  }
}

# Ngrams for Compound Words
DELETE my_index

PUT my_index
{
  "settings": {
    "number_of_shards": 1,
    "analysis": {
      "filter": {
        "trigrams_filter": {
          "type": "ngram",
          "min_gram": 3,
          "max_gram": 3
        }
      },
      "analyzer": {
        "trigrams": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "trigrams_filter"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "trigrams"
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "trigrams",
  "text": "Weißkopfseeadler"
}

POST my_index/_bulk
{ "index": { "_id": 1 }}
{ "text": "Aussprachewörterbuch" }
{ "index": { "_id": 2 }}
{ "text": "Militärgeschichte" }
{ "index": { "_id": 3 }}
{ "text": "Weißkopfseeadler" }
{ "index": { "_id": 4 }}
{ "text": "Weltgesundheitsorganisation" }
{ "index": { "_id": 5 }}
{ "text": "Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz" }

GET my_index/_search
{
  "query": {
    "match": {
      "text": "Adler"
    }
  }
}

# pruning long tail
GET my_index/_search
{
  "query": {
    "match": {
      "text": {
        "query": "Gesundheit"
      }
    }
  }
}

# it seems it's not working....
GET my_index/_search
{
  "query": {
    "match": {
      "text": {
        "query": "Gesundheit",
        "minimum_should_match": "80%"
      }
    }
  }
}



####
# Add-on: using trigram tokenizer
# see: https://stackoverflow.com/questions/50370807/query-elasticsearch-to-make-all-analyzed-ngram-tokens-to-match

DELETE my_index

PUT my_index
{
  "settings": {
    "number_of_shards": 1,
    "analysis": {
      "tokenizer": {
        "trigram_tokenizer": {
          "type": "ngram",
          "min_gram": 3,
          "max_gram": 3,
          "token_chars": [
            "letter",
            "digit"
          ]
        }
      },
      "analyzer": {
        "trigrams": {
          "type": "custom",
          "tokenizer": "trigram_tokenizer",
          "filter": [
            "lowercase"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "trigrams"
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "trigrams",
  "text": "Weißkopfseeadler"
}

POST my_index/_bulk
{ "index": { "_id": 1 }}
{ "text": "Aussprachewörterbuch" }
{ "index": { "_id": 2 }}
{ "text": "Militärgeschichte" }
{ "index": { "_id": 3 }}
{ "text": "Weißkopfseeadler" }
{ "index": { "_id": 4 }}
{ "text": "Weltgesundheitsorganisation" }
{ "index": { "_id": 5 }}
{ "text": "Rindfleischetikettierungsüberwachungsaufgabenübertragungsgesetz" }

GET my_index/_search
{
  "query": {
    "match": {
      "text": "Adler"
    }
  }
}

# pruning long tail
GET my_index/_search
{
  "query": {
    "match": {
      "text": {
        "query": "Gesundheit"
      }
    }
  }
}

# yes it works!
GET my_index/_search
{
  "query": {
    "match": {
      "text": {
        "query": "Gesundheit",
        "minimum_should_match": "80%"
      }
    }
  }
}