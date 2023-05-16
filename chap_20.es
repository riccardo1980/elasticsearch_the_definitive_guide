# Normalizing Tokens

## In That Case

GET _analyze
{
  "tokenizer": "standard",
  "filter": ["lowercase"],
  "text": "The QUICK Brown FOX!"
}

DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_lowercaser": {
          "tokenizer": "standard",
          "filter": [
            "lowercase"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "my_lowercaser",
  "text": "The QUICK Brown FOX!"
}

## You Have an Accent
DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "folding": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "folding",
  "text": ["My œsophagus caused a débâcle"]
}


## Retaining meaning
DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "folding": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "folded": {
            "type": "text",
            "analyzer": "folding"
          }
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "field": "title",
  "text": "Esta està loca"
}

GET my_index/_analyze
{
  "field": "title.folded",
  "text": "Esta está loca"
}


POST my_index/_bulk
{"index": {"_id": 1}}
{"title": "Esta loca!"}
{"index": {"_id": 2}}
{"title": "Está loca!"}

GET my_index/_search
{
  "query": {
    "multi_match": {
      "query": "esta loca",
      "type": "most_fields", 
      "fields": ["title", "title.folded"]
    }
  }
}


GET my_index/_validate/query?explain
{
  "query": {
    "multi_match": {
      "query": "esta loca",
      "type": "most_fields", 
      "fields": ["title", "title.folded"]
    }
  }
}


GET my_index/_validate/query?explain
{
  "query": {
    "multi_match": {
      "query": "está loca",
      "type": "most_fields", 
      "fields": ["title", "title.folded"]
    }
  }
}

## Living in an Unicode World

# ensure we have ICU plugin installed
GET _cat/plugins

DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "filter": {
        "nfkc_normalizer" : {
          "type" : "icu_normalizer",
          "name": "nfkc"
        }
      },
      "analyzer": {
        "my_normalizer": {
          "tokenizer" : "icu_tokenizer",
          "filter": ["nfkc_normalizer"]
        }
      }
    }
  },
   "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "normalized": {
            "type": "text",
            "analyzer": "my_normalizer"
          }
        }
      }
    }
  }
}


POST my_index/_bulk
{"index": {"_id": 1}}
{"text": "suﬃcient"}
{"index": {"_id": 2}}
{"text": "sufficient"}

POST my_index/_search
{
  "query": {
    "match": {
      "text": "sufficient"
    }
  }
}


POST my_index/_search
{
  "query": {
    "match": {
      "text.normalized": "sufficient"
    }
  }
}

# canonical: ligatures as single char
# compatibility: ligatures as multiple chars
# composed: fewest bytes
# decomposed: constituent parts
#|          | canonical | compatibility |
#|----------|-----------|---------------|
#|composed  |    nfc    |     nfkc      |
#|decomposed|    nfd    |     nfkd      |


## Unicode Case Folding
DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "rebuilt_standard": {
          "tokenizer": "standard",
          "filter": [
            "lowercase"
          ]
        },
        "icu_standard_equivalent": {
          "tokenizer": "icu_tokenizer",
          "filter": "icu_normalizer"
        }
      }
    }
  }
}

POST my_index/_analyze
{
  "analyzer": "rebuilt_standard",
  "text": ["Weißkopfseeadler","WEISSKOPFSEEADLER"]
}

POST my_index/_analyze
{
  "analyzer": "standard",
  "text": ["Weißkopfseeadler","WEISSKOPFSEEADLER"]
}


POST my_index/_analyze
{
  "analyzer": "icu_standard_equivalent",
  "text": ["Weißkopfseeadler","WEISSKOPFSEEADLER"]
}


## Unicode Character Folding
DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "standard_asciifolding": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "asciifolding"
          ]
        },
        "icu_standard_asciifolding_equivalent": {
          "tokenizer": "icu_tokenizer",
          "filter": "icu_folding"
        }
      }
    }
  }
}

POST my_index/_analyze
{
  "analyzer": "standard",
  "text": ["١٢٣٤٥", "Weißkopfseeadler","WEISSKOPFSEEADLER"]
}

# wait a minute: standard+asciifolding works for lowercase!
POST my_index/_analyze
{
  "analyzer": "standard_asciifolding",
  "text": ["١٢٣٤٥", "Weißkopfseeadler","WEISSKOPFSEEADLER"]
}

POST my_index/_analyze
{
  "analyzer": "icu_standard_asciifolding_equivalent",
  "text": ["١٢٣٤٥","Weißkopfseeadler","WEISSKOPFSEEADLER"]
}



DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "filter" : {
        "swedish_folding" : {
          "type": "icu_folding",
          "unicode_set_filter" : "[^åäöÅÄÖ]"
        }
      },
      "analyzer": {
        "swedish_analyzer": {
          "tokenizer": "icu_tokenizer",
          "filter": [
            "swedish_folding",
            "lowercase"
          ]
        }
      }
    }
  }
}


POST my_index/_analyze
{
  "analyzer": "swedish_analyzer",
  "text": ["åäöÅÄÖ"]
}

POST _analyze
{
  "tokenizer": "icu_tokenizer", 
  "filter": ["icu_folding"], 
  "text": ["åäöÅÄÖ"]
}


POST _analyze
{
  "tokenizer": "icu_tokenizer", 
  "filter": [{"type": "icu_folding", "unicode_set_filter": "[^åäöÅÄÖ]"}, "lowercase"], 
  "text": ["åäöÅÄÖ"]
}





