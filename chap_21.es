# Reducing words to their root form

GET /_cat/plugins

## Algorithminc Stemmers
DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "filter": {
        "english_stop": {
          "type": "stop",
          "stopwords": "_english_"
        },
        "english_keywords": {
          "type":       "keyword_marker",
          "keywords":   [] 
        },
        "english_stemmer": {
          "type": "stemmer",
          "language": "english"
        },
        "light_english_stemmer": {
          "type": "stemmer",
          "language": "light_english"
        },
        "english_possessive_stemmer": {
          "type": "stemmer",
          "language": "possessive_english"
        }
      },
      "analyzer": {
        "english": {
          "tokenizer": "standard",
          "filter": [
            "english_possessive_stemmer",
            "lowercase",
            "english_stop",
            "english_keywords",
            "english_stemmer"
          ]
        },
        "light_english": {
          "tokenizer": "standard",
          "filter": [
            "english_possessive_stemmer",
            "lowercase",
            "english_stop",
            "light_english_stemmer",
            "asciifolding"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "text": {
        "type": "text",
        "analyzer": "english",
        "fields": {
          "light": {
            "type": "text",
            "analyzer": "light_english"
          }
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "field": "text",
  "text": ["The stem_exclusion parameter allows you to specify"]
}

GET my_index/_analyze
{
  "field": "text.light",
  "text": ["The stem_exclusion parameter allows you to specify"]
}



GET /_analyze
{
  "tokenizer": "standard",
  "filter": [
    {
      "type": "stemmer",
      "language": "possessive_english"
    },
    "lowercase",
    {
      "type": "stop",
      "stopwords": "_english_"
    },
    {
      "type": "hunspell",
      "locale": "en_EN"
    },
    "asciifolding"
  ],
  "text": "The stem_exclusion parameter allows you to specify"
}

# preventing stemming

DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "filter": {
        "no_stem": {
          "type": "keyword_marker",
          "keywords": [
            "skies"
          ]
        }
      },
      "analyzer": {
        "my_english": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "no_stem",
            "porter_stem"
          ]
        },
        "english": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "porter_stem"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "english",
  "text": ["skies"]
}

GET my_index/_analyze
{
  "analyzer": "my_english",
  "text": ["skies"]
}









