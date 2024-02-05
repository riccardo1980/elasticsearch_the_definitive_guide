DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "filter": {
        "index_filter": {
          "type": "common_grams",
          "common_words": "_english_"
        },
        "search_filter": {
          "type": "common_grams",
          "common_words": "_english_",
          "query_mode": true
        }
      },
      "analyzer": {
        "index_grams": {
          "tokenizer": "standard",
          "filter": ["lowercase", "index_filter"]
        },
        "search_grams": {
          "tokenizer": "standard",
          "filter": ["lowercase", "search_filter"]
        }
      }
    }
  }
}

PUT my_index/_mapping
{
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "index_grams",
        "search_analyzer": "standard"
      }
    }
}

POST my_index/_analyze
{
    "analyzer": "index_grams",
    "text": "The quick and brown fox"
}

POST my_index/_analyze
{
    "analyzer": "standard",
    "text": "The quick and brown fox"
}

POST _bulk
{"index": { "_index": "my_index"}}
{"text": "The quick and brown fox"}

# using simple unigram query
POST my_index/_search
{
  "query" :{
    "match": {
      "text": {
        "query": "the quick and brown fox",
        "cutoff_frequency": 0.01
      }
    }
  }
}

# WARNING: 
# # message:
# #! Deprecated field [cutoff_frequency] used,
# replaced by [you can omit this option, the [match] query can skip block of documents efficiently if the total number of hits is not tracked]

# using match phrase
# this is correctly not finding the document if we substitute one stopword fort another
POST my_index/_search
{
  "query" :{
    "match_phrase": {
      "text": {
        "query": "the quick and brown fox",
        "analyzer": "search_grams"
      }
    }
  }
}

POST my_index/_search
{
  "query" :{
    "match_phrase": {
      "text": {
        "query": "the quick the brown fox",
        "analyzer": "search_grams"
      }
    }
  }
}
