# Full-Text Search

# just in case an index with same name has been aready defined
# DELETE my_index

PUT /my_index
{"settings": {"number_of_shards": 1}}

PUT /my_index/_bulk
{"index": {"_id": 1}}
{"title": "The quick brown fox"}
{"index": {"_id": 2}}
{"title": "The quick brown fox jumps over the lazy dog"}
{"index": {"_id": 3}}
{"title": "The quick brown fox jumps over the quick dog"}
{"index": {"_id": 4}}
{"title": "Brown fox brown dog"}

GET my_index/_search
{
  "query": {
    "match": {
      "title": "QUICK!"
    }
  }
}

GET my_index/_search
{
  "query": {
    "match": {
      "title": "BROWN DOG!"
    }
  }
}

GET my_index/_search
{
  "query": {
    "match": {
      "title": {
        "query": "BROWN DOG!",
        "operator": "and"
      }
    }
  }
}


# need 75% (rounded down to 66.7% by ES query)
GET my_index/_search
{
  "query": {
    "match": {
      "title": {
        "query": "quick brown dog",
        "minimum_should_match": "75%"
      }
    }
  }
}

# I prefer the latter, try with 65% vs 67%
GET my_index/_search
{
  "query": {
    "match": {
      "title": {
        "query": "quick yellow dog",
        "minimum_should_match": "67%"
      }
    }
  }
}

# Combining Queries
GET my_index/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "title": "quick"
          }
        }
      ],
      "must_not": [
        {
          "match": {
            "title": "lazy"
          }
        }
      ],
      "should": [
        {
          "match": {
            "title": "brown"
          }
        },
        {
          "match": {
            "title": "dog"
          }
        }
      ]
    }
  }
}


GET my_index/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "title": "brown"
          }
        },
        {
          "match": {
            "title": "fox"
          }
        },
        {
          "match": {
            "title": "dog"
          }
        }
      ],
      "minimum_should_match": 2
    }
  }
}

# above query is equivalent to:
GET my_index/_search
{
  "query": {
    "match": {
      "title": {
        "query": "brown fox dog",
        "minimum_should_match": 2
      }
    }
  }
}

# Controlling analysis

PUT my_index/_mapping
{
  "properties": {
    "english_title": {
      "type": "text",
      "analyzer": "english"
    }
  }
}

GET my_index/_mapping


GET my_index/_analyze
{
  "field": "title",
  "text": "Foxes"
}

GET my_index/_analyze
{
  "field": "english_title",
  "text": "Foxes"
}

GET my_index/_validate/query?explain
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "title": "Foxes"
          }
        },
        {
          "match": {
            "english_title": "Foxes"
          }
        }
      ]
    }
  }
}
