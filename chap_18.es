# Getting Started With Languages

## Using Language Analyzers

# DELETE my_index
PUT /my_index
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text", 
        "analyzer": "english"
      }
    }
  }
}

GET my_index/_analyze
{
  "field": "title",
  "text": ["I'm not happy about the foxes"]
}

DELETE my_index
PUT /my_index
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "english": {
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}


GET my_index/_analyze
{
  "field": "title",
  "text": ["I'm not happy about the foxes"]
}

GET my_index/_analyze
{
  "field": "title.english",
  "text": ["I'm not happy about the foxes"]
}


PUT my_index/_bulk
{"index": {"_id": 1}}
{"title": "I'm happy for this fox"}
{"index": {"_id": 2}}
{"title": "I'm not happy about this fox problem"}

GET my_index/_search
{
  "query": {
    "multi_match": {
      "query": "not happy foxes",
      "type": "most_fields", 
      "fields": ["title", "title.english"]
    }
  }
}

## Configuring Language Analyzers

DELETE my_index

PUT my_index 
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_english": {
          "type": "english",
          "stem_exclusion": ["organization", "organizations"],
          "stopwords": [
            "a", "an", "and", "are", "as", "at", "be", "but", "by", "for",
            "if", "in", "into", "is", "it", "of", "on", "or", "such", "that",
            "the", "their", "then", "there", "these", "they", "this", "to",
            "was", "will", "with"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "my_english",
  "text": ["The World Health Organization does not sell organs"]
}

GET my_index/_analyze
{
  "analyzer": "english",
  "text": ["The World Health Organization does not sell organs"]
}

## One Language Per Document

PUT /blogs-en
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "stemmed": {
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    }
  }
}

PUT /blogs-fr
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text",
        "fields": {
          "stemmed": {
            "type": "text",
            "analyzer": "french"
          }
        }
      }
    }
  }
}

GET blogs-*/_search
{
  "query": {
    "multi_match": {
      "query": "deja vu",
      "fields": [
        "title",
        "title.stemmed"
      ],
      "type": "most_fields"
    }
  },
  "indices_boost": {
    "blogs-en": 3,
    "blogs-fr": 2
  }
}

## One language per field

PUT /movies
{
  "mappings": {
    "properties": {
      "title": {
        "type": "text"
      },
      "title_br": {
        "type": "text",
        "analyzer": "brazilian"
      },
      "title_cz": {
        "type": "text",
        "analyzer": "czech"
      },
      "title_en": {
        "type": "text",
        "analyzer": "english"
      },
      "title_es": {
        "type": "text",
        "analyzer": "spanish"
      }
    }
  }
}

PUT movies/_bulk
{"index":{"_id":1}}
{"title":"Fight club", "title_br":"Clube de Luta", "title_cz":"Klub rvàcu", "title_en":"Fight club", "title_es":"El club de la lucha"}

GET movies/_analyze
{
  "text": "Fight club",
  "field": "title"
}

GET movies/_analyze
{
  "text": "Club de Luta",
  "field": "title_br"
}

GET movies/_analyze
{
  "text": "Fight club",
  "field": "title_en"
}


GET movies/_search
{
  "query": {
    "multi_match": {
      "query": "club de lucha",
      "fields": ["title*", "title_es^2"],
      "type": "most_fields"
    }
  }
}
