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
