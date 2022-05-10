# Structured Search

POST /my_store/_bulk
{"index":{"_id":1}}
{"price":10,"productID":"XHDK-A-1293-#fJ3"}
{"index":{"_id":2}}
{"price":20,"productID":"KDKE-B-9947-#kL5"}
{"index":{"_id":3}}
{"price":30,"productID":"JODL-X-1937-#pV7"}
{"index":{"_id":4}}
{"price":30,"productID":"QQPX-R-3956-#aD8"}

GET /my_store/_mapping

# you can also remove "must" section: in that case max_score = 0.0, _score = 0.0
GET /my_store/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match_all": {}
        }
      ],
      "filter": [
        {
          "term": {
            "price": "20"
          }
        }
      ]
    }
  }
}

# no need to define a new mapping: use keyword subfield of productID:

GET /my_store/_mapping/field/productID.keyword

GET /my_store/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "term": {
            "productID.keyword":"XHDK-A-1293-#fJ3"
          }
        }
      ]
    }
  }
}

GET /my_store/_analyze
{
  "field": "productID",
  "text": ["KDKE-B-9947-#kL5"]
}


# combining filters
GET /my_store/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "bool": {
            "must_not": [
              {
                "term": {
                  "price": {
                    "value": "30"
                  }
                }
              }
            ],
            "should": [
              {
                "term": {
                  "price": {
                    "value": "20",
                    "_name": "price"
                  }
                }
              },
              {
                "term": {
                  "productID.keyword": {
                    "value": "XHDK-A-1293-#fJ3",
                    "_name": "product"
                  }
                }
              }
            ],
            "minimum_should_match": 1
          }
        }
      ]
    }
  }
}

GET /my_store/_search
{
  "query": {
    "bool": {
      "filter": {
        "bool": {
          "should": [
            {
              "term": {
                "productID.keyword": {
                  "value": "KDKE-B-9947-#kL5",
                  "_name": "first"
                }
              }
            },
            {
              "bool": {
                "must": [
                  {
                    "term": {
                      "productID.keyword": "JODL-X-1937-#pV7"
                    }
                  },
                  {
                    "term": {
                      "price": 30
                    }
                  }
                ],
                "_name": "second"
              }
            }
          ],
          "minimum_should_match": 1
        }
      }
    }
  }
}

GET my_store/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "terms": {
            "price": [
              20,
              30
            ]
          }
        }
      ]
    }
  }
}


# Contains but does not equal

POST /my_store2/_bulk
{"index":{"_id":1}}
{"tags": ["search"]}
{"index":{"_id":2}}
{"tags": ["search", "open source"]}

GET my_store2/_mapping

GET my_store2/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "term": {
            "tags.keyword": "search"
          }
        }
      ]
    }
  }
}

POST /my_store3/_bulk
{"index":{"_id":1}}
{"tags": ["search"], "tag_count": 1}
{"index":{"_id":2}}
{"tags": ["search", "open source"], "tag_count": 2}

GET my_store3/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "bool": {
            "must": [
              {
                "term": {
                  "tags.keyword": "search"
                }
              },
              {
                "term": {
                  "tag_count": 1
                }
              }
            ]
          }
        }
      ]
    }
  }
}

# Dealing with NULL values

POST my_index_with_nulls/_bulk
{ "index": {"_id": 1}}
{"tags": ["search"]}
{ "index": {"_id": 2}}
{"tags": ["search", "open source"]}
{ "index": {"_id": 3}}
{"other_field": "some data"}
{ "index": {"_id": 4}}
{"tags": null}
{ "index": {"_id": 5}}
{"tags": ["search", null]}

# documents with field having a value
GET my_index_with_nulls/_search
{
  "query": {
    "bool": {
      "filter": [
        {
          "exists": {
            "field": "tags"
          }
        }
      ]
    }
  }
}

# documents with no field or null values only
GET my_index_with_nulls/_search
{
  "query": {
    "bool": {
      "must_not": [
        {"exists": {"field": "tags"}}
      ]
    }
  }
}
