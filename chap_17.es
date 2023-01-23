# Controlling relevance

## Term Frequency/Inverse Document Frequency
### Term Frequency

DELETE my_index

PUT my_index
{
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "index_options": "positions",
        "fields": {
          "docs": {
            "type": "text",
            "index_options": "docs"
          },
          "freqs": {
            "type": "text",
            "index_options": "freqs"
          },
          "offsets": {
            "type": "text",
            "index_options": "offsets"
          }
        }
      }
    }
  }
}

GET my_index/_mapping

POST my_index/_bulk
{"index": {"_id": 1}}
{"text": "Sue ate the alligator"}
{"index": {"_id": 2}}
{"text": "The alligator ate Sue"}
{"index": {"_id": 3}}
{"text": "Sue never goes anywhere without her alligator skin purse"}
{"index": {"_id": 4}}
{"text": "Sue never goes anywhere without her alligator skin purse alligator"}
{"index": {"_id": 5}}
{"text": "never"}
{"index": {"_id": 6}}
{"text": "never never never never never"}

# analyzer seems the same
GET my_index/_analyze
{
  "field": "text.offsets",
  "text": ["Sue never goes anywhere without her alligator skin purse"]
}

# this query
# - throws error in case of doc, freq
# - returns ok in case of positions, offsets
GET my_index/_search
{
  "query": {
    "match_phrase": {
      "text": {
        "query": "never goes"
      }
    }
  }
}

# match on:
# - text (positions) gives two distinct _score for 5 and 6
# - text.docs (docs) gives same _score for 5 and 6
GET my_index/_search
{
  "query": {
    "match": {
      "text": {
        "query": "never"
      }
    }
  }
}

GET my_index/_search
{
  "query": {
    "match": {
      "text.docs": {
        "query": "never"
      }
    }
  }
}

## Putting it together
DELETE my_index

PUT /my_index/_doc/1
{"text": "quick brown fox"}

GET my_index/_explain/1
{
  "query": {
    "match": {
      "text": "fox"
    }
  }
}


## Lucene's practical Scoring Function:
# queryNorm and coord are removed since Lucene 7
# see: https://issues.apache.org/jira/browse/LUCENE-7347

## Manipulating Relevance with Query Structure

DELETE my_index

PUT /my_index/_doc/1
{"text": "quick brown fox"}

# since queryNorm has been removed, below queries are equal:

GET my_index/_explain/1
{
  "query": {
    "bool": {
      "should" : [
        {"match": {"text": "quick"}},
        {"match": {"text": "brown"}},
        {"match": {"text": "red"}},
        {"match": {"text": "fox"}}
        
      ]
    }
  }
}

GET my_index/_explain/1
{
  "query": {
    "bool": {
      "should": [
        {"match": {"text": "quick"}},
        {"match": {"text": "brown"}},
        {
          "bool": {
            "should": [
              {"match": {"text": "red"}},
              {"match": {"text": "fox"}}
            ]
          }
        }
      ]
    }
  }
}

## Boosting an index

PUT /my_index_1/_doc/1
{"text": "quick brown fox"}
PUT /my_index_2/_doc/2
{"text": "quick brown fox"}

# with no index boosting
GET /my_index_*/_search
{
  "query": {
    "match": {
      "text": "fox"
    }
  }
}

# with index boosting
GET /my_index_*/_search
{
  "indices_boost": {
    "my_index_1": 1,
    "my_index_2": 2
  },
  "query": {
    "match": {
      "text": "fox"
    }
  }
}

# DELETE my_index

PUT /my_index/_bulk
{"index": {"_id": 1}}
{"text": "Apple pie"}
{"index": {"_id": 2}}
{"text": "Apple inc"}

# simple match query
GET my_index/_search
{
  "query": {
    "match": {
      "text": "apple"
    }
  }
}

# using boosting query
GET my_index/_search
{
  "query": {
    "boosting": {
      "positive": {
        "match": {
          "text": "apple"
        }
      },
      "negative": {
        "match": {
          "text": "pie tart fruit crumble tree"
        }
      },
      "negative_boost": 0.2
    }
  }
}

DELETE my_index

PUT /my_index/_bulk
{"index": {"_id": 1}}
{"description": "wifi garden pool"}
{"index": {"_id": 2}}
{"description": "wifi garden pool pool"}

# _id 2 gets higher _score
GET my_index/_search
{
  "query" :{
    "match": {
      "description": "wifi garden pool"
    }
  }
}


GET my_index/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "constant_score": {
            "filter": {
              "match": {
                "description": "wifi"
              }
            }
          }
        },
        {
          "constant_score": {
            "filter": {
              "match": {
                "description": "garden"
              }
            }
          }
        },
        {
          "constant_score": {
            "filter": {
              "match": {
                "description": "pool"
              }
            }
          }
        }
      ]
    }
  }
}


# alternate solution: 
# "index_options": "docs" at index time on description field

## Boosting by Popularity
PUT blogposts/_bulk
{"index": {"_id":1}}
{"title": "About popularity", "content": "in this post we will talk about...", "votes": 6}
{"index": {"_id":2}}
{"title": "About popularity", "content": "in this post we will talk about...", "votes": 2}

GET /blogposts/_search
{
  "query": {
    "function_score": {
      "query": {
        "multi_match": {
          "query": "popularity",
          "fields": [
            "title",
            "content"
          ]
        }
      },
      "field_value_factor": {
        "field": "votes"
      }
    }
  }
}


POST /blogposts/_explain/1
{
  "query": {
    "function_score": {
      "query": {
        "multi_match": {
          "query": "popularity",
          "fields": [
            "title",
            "content"
          ]
        }
      },
      "field_value_factor": {
        "field": "votes"
      }
    }
  }
}

## Boosting Filtered Subset

DELETE my_index

PUT /my_index/_bulk
{"index": {"_id": 1}}
{"city": "Barcelona", "features": "wifi garden pool"}
{"index": {"_id": 2}}
{"city": "Barcelona", "features": "wifi pool"}

GET my_index/_search
{
  "query": {
    "function_score": {
      "query": {
        "bool": {
          "must": [
            {
              "match_all": {}
            }
          ],
          "filter": [
            {
              "match": {
                "city": "Barcelona"
              }
            }
          ]
        }
      },
      "functions": [
        {
          "filter": {
            "match": {
              "features": "wifi"
            }
          },
          "weight": 1
        },
        {
          "filter": {
            "match": {
              "features": "garden"
            }
          },
          "weight": 1
        },
        {
          "filter": {
            "match": {
              "features": "pool"
            }
          },
          "weight": 2
        }
      ],
      "score_mode": "sum"
    }
  }
}

# The Closer, The Better
# DELETE geo_locations
PUT geo_locations
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      },
      "price": {
        "type": "float"
      },
      "name": {
        "type": "text"
      }
    }
  }
}

POST geo_locations/_bulk
{"index":{"_id":1}}
{"location":{"lat":51.5,"lon":0.12},"price":100,"name": "At the center, should return 2 (multiply) or 3 (sum)"}
{"index":{"_id":2}}
{"location":{"lat":51.6,"lon":0.11},"price":120,"name": "Slightly off, at scale for price"}


GET geo_locations/_search
{
  "query": {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "functions": [
        {
          "gauss": {
            "location": {
              "origin": {
                "lat": 51.5,
                "lon": 0.12
              },
              "offset": "2km",
              "scale": "3km"
            }
          }
        },
        {
          "gauss": {
            "price": {
              "origin": "50",
              "offset": "50",
              "scale": "20"
            }
          },
          "weight": 2
        }
      ],
      "score_mode": "multiply"
    }
  }
}

GET geo_locations/_explain/1
{
  "query": {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "functions": [
        {
          "gauss": {
            "location": {
              "origin": {
                "lat": 51.5,
                "lon": 0.12
              },
              "offset": "2km",
              "scale": "3km"
            }
          }
        },
        {
          "gauss": {
            "price": {
              "origin": "50",
              "offset": "50",
              "scale": "20"
            }
          },
          "weight": 2
        }
      ],
      "score_mode": "multiply"
    }
  }
}


## scoring with scripts

# DELETE geo_locations
PUT geo_locations
{
  "mappings": {
    "properties": {
      "location": {
        "type": "geo_point"
      },
      "price": {
        "type": "float"
      },
      "margin": {
        "type": "float"
      },
      "name": {
        "type": "text"
      }
    }
  }
}

POST geo_locations/_bulk
{"index":{"_id":1}}
{"location":{"lat":51.5,"lon":0.12},"price":50,"margin":1,"name":"should return 1+2+5"}
{"index":{"_id":2}}
{"location":{"lat":51.5,"lon":0.12},"price":200,"margin":1,"name":"should return 1+0+19"}

GET geo_locations/_explain/2
{
  "query": {
    "function_score": {
      "query": {
        "match_all": {}
      },
      "functions": [
        {
          "gauss": {
            "location": {
              "origin": {
                "lat": 51.5,
                "lon": 0.12
              },
              "offset": "2km",
              "scale": "3km"
            }
          }
        },
        {
          "gauss": {
            "price": {
              "origin": "50",
              "offset": "50",
              "scale": "20"
            }
          },
          "weight": 2
        },
        {
          "script_score": {
            "script": {
              "params": {
                "threshold": 80,
                "discount": 0.1,
                "target": 10
              },
              "lang": "painless",
              "source": """
                def price = doc['price'].value;
                def margin = doc['margin'].value;
                if (price < params.threshold){
                  return price * margin / params.target;
                }
                return price * (1-params.discount) * margin /params.target;
              """
            }
          }
        }
      ],
      "score_mode": "sum"
    }
  }
}






