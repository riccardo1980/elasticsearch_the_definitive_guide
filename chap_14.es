# Multifield search

POST /nested_should/_bulk
{"index":{"_id":1}}
{"title": "War and Peace","author": "Leo Tolstoy", "translator": "Constance Garnett"}
{"index":{"_id":2}}
{"title": "War and Peace","author": "Leo Tolstoy", "translator": "Louise Maude"}
{"index":{"_id":3}}
{"title": "War and Peace","author": "Leo Tolstoy", "translator": "Pippo"}
{"index":{"_id":4}}
{"title": "War and Peace","author": "Leo Tolstoy", "translator": "Pluto"}
{"index":{"_id":5}}
{"title": "Filastrocche","author": "Leo Tolstoy", "translator": "Constance Garnett"}
{"index":{"_id":6}}
{"title": "Novelle","author": "Leo Tolstoy", "translator": "Louise Maude"}

# order of the reults:
# 1 2 
# 5 6 
# 3 4

GET nested_should/_search
{
  "query": {
    "bool": {
      "should": [
        {"match": {"title": "War and Peace"}},
        {"match": {"author": "Leo Tolstoy"}},
        {
          "bool": {
            "should": [
              {"match": {"translator": "Constance Garnett"}},
              {"match": {"translator": "Louise Maude"}}
            ]
          }
        }
      ]
    }
  }
}

# get lower level queries: same results

GET nested_should/_validate/query?rewrite=true
{
  "query": {
    "bool": {
      "should": [
        {"match": {"title": "War and Peace"}},
        {"match": {"author": "Leo Tolstoy"}},
        {"match": {"translator": "Constance Garnett"}},
        {"match": {"translator": "Louise Maude"}}
      ]
    }
  }
}

GET nested_should/_validate/query?rewrite=true
{
  "query": {
    "bool": {
      "should": [
        {"match": {"title": "War and Peace"}},
        {"match": {"author": "Leo Tolstoy"}},
        {
          "bool": {
            "should": [
              {"match": {"translator": "Constance Garnett"}},
              {"match": {"translator": "Louise Maude"}}
            ]
          }
        }
      ]
    }
  }
}

###############################################
# best fields
# When fields are in competition
# - words mean more together: e.g. when coming from a single field
# - getting the score from best-matching field

PUT best_field_index/_bulk
{"index":{"_id":1}}
{"title":"Quick brown rabbits","body":"Brown rabbits are commonly seen."}
{"index":{"_id":2}}
{"title":"Keeping pets healthy","body":"My quick brown fox eats rabbits on a regular basis."}

# document 1 has higher _score since bool works as "more-matches-is-better" 
GET best_field_index/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "title": "Brown fox"
          }
        },
        {
          "match": {
            "body": "Brown fox"
          }
        }
      ]
    }
  }
}

# now document 2 is more relevant
GET best_field_index/_search
{
  "query": {
    "dis_max": {
      "tie_breaker": 0,
      "boost": 1.2,
      "queries": [
        {
          "match": {
            "title": "Brown fox"
          }
        },
        {
          "match": {
            "body": "Brown fox"
          }
        }
      ]
    }
  }
}

# using tie breaker 
GET best_field_index/_search
{
  "query": {
    "dis_max": {
      "tie_breaker": 0.3,
      "boost": 1.2,
      "queries": [
        {
          "match": {
            "title": "Quick pets"
          }
        },
        {
          "match": {
            "body": "Quick pets"
          }
        }
      ]
    }
  }
}

# multi_match

# the following is equivalent to dis_max query above
GET best_field_index/_search
{
  "query": {
    "multi_match": {
      "query": "Quick pets",
      "fields": ["title", "body"],
      "type": "best_fields",
      "tie_breaker": 0.3,
      "boost": 1.2
    }
  }
}


GET best_field_index/_search
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "title": "Brown fox"
          }
        },
        {
          "match": {
            "body": "Brown fox"
          }
        }
      ]
    }
  }
}

# the following is equivalent to bool+should query above
GET best_field_index/_search
{
  "query": {
    "multi_match": {
      "query": "Brown fox",
      "fields": ["title", "body"],
      "type": "most_fields"
    }
  }
}

#########################################################
# Most fields
# adding multifield mapping:
# - "title": fully analyzed
# - "title.std": unstemmed version, to match full words
# - original with diacritics, to match accents
# - shingles, for word proximity

DELETE my_index
PUT my_index
{
  "settings": {"number_of_shards": 1},
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "english",
        "fields": {
          "std": {
            "type": "text",
            "analyzer": "standard"
          }
        }
      }
    }
  }
}

PUT my_index/_bulk
{"index": {"_id": 1}}
{"title": "My rabbit jumps"}
{"index": {"_id": 2}}
{"title": "Jumping jack rabbits"}

# results are considered equal
GET my_index/_search
{
  "query": {
    "match": {
      "title": "jumping rabbits"
    }
  }
}

# now we get a relevant number of documents: 
# - we boost title, to make the most important field 
# - we signal exact matches

GET my_index/_search
{
  "query": {
    "multi_match": {
      "query": "jumping rabbits",
      "type": "most_fields",
      "fields": ["title^10","title.std"]
    }
  }
}


###########################
# Cross-field entity search
# When information is spread across several fields
# 

PUT cross_fields/_bulk
{"index":{"_id":1}}
{"firstname":"Peter","lastname":"Smith"}
{"index":{"_id":2}}
{"street":"5 Poland Street","city":"London","country":"United Kingdom","postcode":"W1V 3DG"}

# naive solution: matching the same word in multiple fields
GET cross_fields/_validate/query?rewrite=true
{
  "query": {
    "bool": {
      "should": [
        {
          "match": {
            "country": "Poland Street W1V"
          }
        },
        {
          "match": {
            "city": "Poland Street W1V"
          }
        },
        {
          "match": {
            "street": "Poland Street W1V"
          }
        },
        {
          "match": {
            "postcode": "Poland Street W1V"
          }
        }
      ]
    }
  }
}

# equivalent solution:
GET cross_fields/_validate/query?rewrite=true
{
  "query": {
    "multi_match": {
      "query": "Poland Street W1V",
      "type": "most_fields",
      "fields": [
        "street",
        "city",
        "country",
        "postcode"
      ]
    }
  }
}

# drawbacks: most_field is field-centric:
# 1. same word matches in multiple fields
# 2. operator is per field
# 3. term frequencies are different for each field

# 1. 
GET cross_fields/_validate/query?rewrite=true
{
  "query": {
    "multi_match": {
      "query": "Poland Street W1V",
      "type": "most_fields",
      "fields": [
        "street",
        "city",
        "country",
        "postcode"
      ]
    }
  }
}

# 2. 
GET cross_fields/_validate/query?rewrite=true
{
  "query": {
    "multi_match": {
      "query": "Poland Street W1V",
      "type": "most_fields",
      "operator": "and", 
      "fields": [
        "street",
        "city",
        "country",
        "postcode"
      ]
    }
  }
}

# 3. (I give up, but the direction is clear)
PUT cross_fields_draw3/_bulk
{"index":{"_id":1}}
{"firstname":"Peter","lastname":"Smith"}
{"index":{"_id":2}}
{"firstname":"Smith","lastname":"Williams"}
{"index":{"_id":3}}
{"firstname":"Joseph","lastname":"Smith"}
{"index":{"_id":4}}
{"firstname":"Arnold","lastname":"Smith"}
{"index":{"_id":5}}
{"firstname":"Richard","lastname":"Smith"}
{"index":{"_id":6}}
{"firstname":"Robert","lastname":"Smith"}
{"index":{"_id":7}}
{"firstname":"Thomas","lastname":"Smith"}
{"index":{"_id":8}}
{"firstname":"Mattew","lastname":"Smith"}
{"index":{"_id":9}}
{"firstname":"Brandon","lastname":"Smith"}
{"index":{"_id":10}}
{"firstname":"Dave","lastname":"Smith"}
{"index":{"_id":11}}
{"firstname":"Jacob","lastname":"Smith"}
{"index":{"_id":12}}
{"firstname":"Rhonda","lastname":"Smith"}
{"index":{"_id":13}}
{"firstname":"Anna","lastname":"Smith"}
{"index":{"_id":14}}
{"firstname":"Lorraine","lastname":"Smith"}
{"index":{"_id":15}}
{"firstname":"Sigmund","lastname":"Smith"}
{"index":{"_id":16}}
{"firstname":"Sigmund","lastname":"Smith"}
{"index":{"_id":17}}
{"firstname":"Gustav","lastname":"Smith"}
{"index":{"_id":18}}
{"firstname":"Aldo","lastname":"Smith"}

GET cross_fields_draw3/_search
{
  "query": {
    "multi_match": {
      "query": "Peter Smith",
      "type": "most_fields",
      "fields": [
        "firstname",
        "lastname"
      ]
    }
  }
}

# index time solution

PUT cross_fields_copy_to/
{
  "mappings": {
    "properties": {
      "firstname": {
        "type": "text",
        "copy_to": "fullname"
      },
      "lastname": {
        "type": "text",
        "copy_to": "fullname"
      },
      "fullname": {
        "type": "text"
      }
    }
  }
}

POST cross_fields_copy_to/_bulk
{"index":{"_id":1}}
{"firstname":"Donald","lastname":"Duck"}
{"index":{"_id":2}}
{"firstname":"Mickey","lastname":"Mouse"}

# index time solution: copy_to
# Solves: 
# 1. same word matches in multiple fields
# 2. operator is per field
# 3. term frequencies are different for each field

GET cross_fields_copy_to/_validate/query?rewrite=true
{
  "query": {
    "match": {
      "fullname": {
        "query": "donald trump",
        "operator": "and"
      }
    }
  }
}

# query time solution: cross_fields
# solves:
# 1. same word matches in multiple fields
# 2. operator is per field
#
# Not solving: differences on IDF's in the fields
# 
GET cross_fields_copy_to/_validate/query?rewrite=true
{
  "query": {
    "multi_match": {
      "type": "cross_fields", 
      "query": "donald trump",
      "operator": "and", 
      "fields": ["firstname","lastname"]
    }
  }
}

# this approach is suggested as a more robust alternative: 
# https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html#type-cross-fields
# https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-combined-fields-query.html
# https://github.com/elastic/elasticsearch/issues/41106

GET cross_fields_copy_to/_validate/query?rewrite=true
{
  "query": {
    "combined_fields": {
      "query": "donald trump",
      "operator": "and", 
      "fields": ["firstname","lastname"]
    }
  }
}
#####################################################################################

DELETE my_index_complete

# Fields:
# - main field
#   - title: analyzer english
# - signals
#   - title.std: analyzer standard
#   - title.shingles: tokenizer standard, shingle filter

PUT my_index_complete
{
  "settings": {
    "number_of_shards": 1,
    "analysis": {
      "analyzer": {
        "standard_shingle": {
          "tokenizer": "standard",
          "filter": [
            "shingle"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "english",
        "fields": {
          "std": {
            "type": "text",
            "analyzer": "standard"
          },
          "shingles": {
            "type": "text",
            "analyzer": "standard_shingle"
          }
        }
      }
    }
  }
}

PUT my_index_complete/_bulk
{"index": {"_id": 1}}
{"title": "My rabbit jumps"}
{"index": {"_id": 2}}
{"title": "Jumping jack rabbits"}
{"index": {"_id": 3}}
{"title": "rabbits are eaten by jack"}


# results 2 and 3 are considered equal
GET my_index_complete/_search
{
  "query": {
    "match": {
      "title": "jack rabbits"
    }
  }
}

GET my_index_complete/_search
{
  "query": {
    "multi_match": {
      "query": "jack rabbits",
      "type": "most_fields",
      "fields": ["title^10","title.std"]
    }
  }
}

# now we signal word order
GET my_index_complete/_search
{
  "query": {
    "multi_match": {
      "query": "jack rabbits",
      "type": "most_fields",
      "fields": ["title^10","title.std","title.shingles"]
    }
  }
}

GET my_index_complete/_validate/query?rewrite=true
{
  "query": {
    "multi_match": {
      "query": "jack rabbits",
      "type": "most_fields",
      "fields": ["title^10","title.std","title.shingles"]
    }
  }
}

GET my_index_complete/_validate/query?rewrite=true
{
  "query": {
    "multi_match": {
      "query": "jumping rabbits",
      "type": "most_fields",
      "fields": ["title^10","title.std"]
    }
  }
}

GET my_index_complete/_analyze
{
  "text": ["jumping rabbits"],
  "field": "title"
}

GET my_index_complete/_analyze
{
  "text": ["jumping rabbits"],
  "field": "title.std"
}

GET my_index_complete/_analyze
{
  "text": ["jumping rabbits"],
  "field": "title.shingles"
}