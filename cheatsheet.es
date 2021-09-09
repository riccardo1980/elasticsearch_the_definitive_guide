# query DSL language

# get indices list
GET /_cat/indices

# count elements in an index
GET /<index_name>/_count

# match query
GET /<index_name>/_search
{
  "query": {
    "match": {
      "FIELD": "TEXT"
    }
  }
}
# or
GET /<index_name>/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "FIELD": "TEXT"
          }
        }
      ]
    }
  }
}
