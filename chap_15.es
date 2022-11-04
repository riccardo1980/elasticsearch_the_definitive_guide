# Proximity matching

# just in case an index with same name has been aready defined
DELETE my_index

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
    "match_phrase": {
      "title": "quick brown fox"
    }
  }
}


GET _analyze
{
  "analyzer": "standard",
  "text": ["quick brown fox"]
}


GET my_index/_search
{
  "query": {
    "match_phrase": {
      "title": {
        "query": "quick fox",
        "slop": 1
      }
    }
  }
}


PUT /my_index_groups
{"settings": {"number_of_shards": 1}}

POST my_index_groups/1
{
  "names": [ "John Abraham", "Lincoln Smith" ]
}

# it seems that a default gap of 100 is used
GET my_index_groups/_search
{
  "query": {
    "match_phrase": {
      "names": { "query": "Abraham Lincoln", "slop": 100}
    }
  }
}

# yes
GET my_index_groups/_analyze
{
  "field": "names",
  "text": ["John Abraham", "Lincoln Smith"]
}


# shrink the gap
PUT my_index_groups_2
{
  "mappings": {
    "properties": {
      "names": {
        "type": "text",
        "position_increment_gap": 0
      }
    }
  }
}

# check
GET my_index_groups_2/_analyze
{
  "field": "names",
  "text": ["John Abraham", "Lincoln Smith"]
}

POST my_index_groups_2/_doc/1
{
  "names": [ "John Abraham", "Lincoln Smith" ]
}

#
GET my_index_groups_2/_search
{
  "query": {
    "match_phrase": {
      "names": { "query": "Abraham Lincoln"}
    }
  }
}

## Proximity for Relevance
GET my_index/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "title": {
              "query": "quick brown fox",
              "minimum_should_match": "30%"
            }
          }
        }
      ],
      "should": [
        {
          "match_phrase": {
            "title": {
              "query": "quick brown fox",
              "slop": 50
            }
          }
        }
      ]
    }
  }
}

## Rescoring results

GET my_index/_search
{
  "query": {
    "match": {
      "title": {
        "query": "quick brown fox",
        "minimum_should_match": "30%"
      }
    }
  },
  "rescore": {
    "query": {
      "rescore_query": {
        "match_phrase": {
          "title": {
            "query": "quick brown fox",
            "slop": 50
          }
        }
      }
    },
    "window_size": 50
  }
}

## Finding Associated Words
### Producing Shingles

DELETE /my_index

PUT /my_index
{
  "settings": {
    "number_of_shards": 1,
    "analysis": {
      "filter": {
        "my_shingle_filter": {
          "type": "shingle",
          "min_shingle_size": 2,
          "max_shingle_size": 2,
          "output_unigrams": false
        }
      },
      "analyzer": {
        "my_shingle_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "my_shingle_filter"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "my_shingle_analyzer",
  "text": ["Sue ate the alligator"]
}

PUT my_index/_mapping
{
  "properties": {
    "title": {
      "type": "text",
      "fields": {
        "shingles" : {
          "type": "text",
          "analyzer": "my_shingle_analyzer"
        }
      }
    }
  }
}

POST my_index/_bulk
{"index": {"_id": 1}}
{"title": "Sue ate the alligator"}
{"index": {"_id": 2}}
{"title": "The alligator ate Sue"}
{"index": {"_id": 3}}
{"title": "Sue never goes anywhere without her alligator skin purse"}

GET my_index/_analyze
{
  "field": "title.shingles",
  "text": ["Sue never goes anywhere without her alligator skin purse"]
}

# document 1 and 2 get same score
GET my_index/_search
{
  "query": {
    "match": {
      "title": "the hungry alligator ate sue"
    }
  }
}

GET my_index/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "title": "the hungry alligator ate sue"
          }
        }
      ],
      "should": [
        {
          "match": {
            "title.shingles": "the hungry alligator ate sue"
          }
        }
      ]
    }
  }
}

# TL;DR
# - with exact order, when matching all words: match_phrase
# - with relavance on order, when matching all words: match + should match on match_phrase
#   (but consider a performance decrease, might be more efficient a rescore on match_phrase)
# - with relavance on order, when matching most words: match + should match on shingles
#   (this is also performance savvy)