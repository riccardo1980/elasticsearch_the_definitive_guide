# Sorting and Relevance
#######################

# Sorting by field value
GET gb-tweet,us-tweet/_search
{
  "query": {
    "bool": {
      "filter": { "term": {"user_id": 1}}
    }
  },
  "sort": [ {"date": {"order": "desc"}}
  ]
}


# Multilevel sorting
GET gb-tweet,us-tweet/_search
{
  "query": {
    "bool": {
      "must": {"match": {"tweet": "manage text search"}}, 
      "filter": { "term": {"user_id": 2}}
    }
  },
  "sort": [ 
    {"date": {"order": "desc"}},
    {"_score": {"order": "desc"}}
  ]
}

# define an index with both analyzed and not analyzed multifields

PUT /naive-index
{
  "mappings": {
    "properties": {
      "tweet": {
        "type": "text",
        "analyzer": "english",
        "fields": {
          "raw": {
            "type": "keyword",
            "ignore_above": 256
          }
        }
      }
    }
  }
}

# String sorting and Multifields
POST _bulk 
{"index": {"_index": "naive-index"}}
{"tweet": "ABC here I am, Ricky's example"}
{"index": {"_index": "naive-index"}}
{"tweet": "abc here I am, Ricky's example number 2"}

GET /naive-index/_analyze
{
  "field": "tweet",
  "text": "ABC here I am, Ricky's example"
}

GET /naive-index/_analyze
{
  "field": "tweet.raw",
  "text": "ABC here I am, Ricky's example"
}

GET /naive-index/_search?explain
{
  "query": {
    "match": {
      "tweet": "ABC"
    }
  },
  "sort": "tweet.raw"
}

# need to pick document id
# might be simple to read results in YAML format: add ?format=YAML to query string
GET naive-index/_explain/V9ChCH8BJwDNtoc-9l8c?format=YAML
{
  "query": {
    "match": {
      "tweet": "ABC"
    }
  }
}

# Understanding Why a Document Matched (and didn't...)
GET gb-tweet/_explain/3
{
  "query": {
    "bool": {
      "filter": { "term": {"user_id": 1}}
    }
  }
}

# UTILS
##########

GET _cat/indices

GET *-tweet/_mapping

GET _cluster/health