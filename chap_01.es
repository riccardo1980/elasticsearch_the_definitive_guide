# page 12: adding documents
PUT /megacorp/_doc/1
{
  "first_name": "Jane",
  "last_name": "Smith",
  "age": 32,
  "about": "I like to collect rock albums",
  "interests": ["music"]
}

# page 13: retrieving document by index
GET /megacorp/_doc/1

# page 16: full text match query
GET /megacorp/_search
{
  "query": {
    "match": {
      "last_name": "Smith"
    }
  }
}

# page 16: filtered queries
GET /megacorp/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "range": {
            "age": {
              "gte": 30
            }
          }
        }
      ],
      "must": [
        {
          "match": {
            "last_name": "Smith"
          }
        }
      ]
    }
  }
}

# page 19: phrase match query (with highlight)
GET /megacorp/_search
{
  "query": {
    "match_phrase": {
      "about": "rock climbing"
    }
  },
  "highlight": {
    "fields":{
      "about" : {}
    }
  }
}

# page 21: analytics on text fields
# see: https://www.elastic.co/guide/en/elasticsearch/reference/current/text.html

# Note: analytics are performed over interests.keyword field
GET /megacorp/_search
{
  "aggs": {
    "all_interests": {
      "terms": {
        "field": "interests.keyword"
      }
    }
  }
}

GET /megacorp/_search
{
  "aggs": {
    "all_interests": {
      "terms": {
        "field": "interests.keyword"
      },
      "aggs": {
        "avg_name": {
          "avg": {
            "field": "age"
          }
        }
      }
    }
  }
}