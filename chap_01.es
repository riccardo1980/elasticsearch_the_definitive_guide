# pag 16: filtered queries
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

# pag 21: analytics on text fields
# see: https://www.elastic.co/guide/en/elasticsearch/reference/current/text.html

# option 1: enable fielddata on field

PUT /megacorp/_mapping
{
  "properties": {
    "interests": { 
      "type":     "text",
      "fielddata": true
    }
  }
}

GET /megacorp/_search
{
  "aggs": {
    "all_interests": {
      "terms": {
        "field": "interests",
      }
    }
  }
}
