# Index Management
PUT my_temp_index
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0
  }
}

GET my_temp_index

PUT my_temp_index/_settings
{
  "number_of_replicas": 1
}

GET my_temp_index

PUT /spanish_docs
{
  "settings": {
    "analysis": {
      "analyzer": {
        "es_std": {
          "type": "standard",
          "stopwords": "_spanish_"
        }
      }
    }
  }
}

GET /spanish_docs/_analyze
{
  "analyzer": "es_std",
  "text": ["El veloz zorro marrón"]
}

PUT /my_index
{
  "settings": {
    "analysis": {
      "char_filter": {
        "&_to_and": {
          "type": "mapping",
          "mappings": [
            "&=> and "
          ]
        }
      },
      "filter": {
        "my_stopwords": {
          "type": "stop",
          "stopwords": [
            "the",
            "a"
          ]
        }
      },
      "analyzer": {
        "my_analyzer": {
          "type": "custom",
          "char_filter": [
            "html_strip",
            "&_to_and"
          ],
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "my_stopwords"
          ]
        }
      }
    }
  }
}


GET /my_index/_analyze
{
  "analyzer": "my_analyzer",
  "text": ["The quick & brown fox"]
}

PUT /my_index/_mapping
{
  "properties": {
    "title": {
      "type": "text",
      "analyzer": "my_analyzer"
    }
  }
}

GET /my_index


PUT /my_index/_mapping
{
  "properties": {
    "my_type": {
      "type": "text",
      "_source": {
        "enabled": false
      }
    }
  }
}

# _id.path
# Deprecated since 1.5, _id field is not configurable in the mappings.
# see: https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-id-field.html

# Dynamic mapping

PUT my_index_strict
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "title": {
        "type": "text"
      },
      "stash" : {
        "type": "object",
        "dynamic": true
      }
    }
  }
}

POST my_index_strict/_doc
{
  "title": "abstract to be filled",
  "stash" : {}
}

GET my_index_strict/_search

# this should throw an error
POST my_index_strict/_doc
{
  "title": "abstract to be filled",
  "stash" : {},
  "message": "me"
}

# this is allowed
POST my_index_strict/_doc
{
  "title": "This is a title",
  "stash" : {
    "message": "me as author"
  }
}

GET my_index_strict/_mapping

# dynamic_templates

PUT my_index_dynamic
{
  "mappings": {
    "dynamic_templates": [
      {
        "es": {
          "match": "*_es",
          "match_mapping_type": "string",
          "mapping": {
            "type": "text",
            "analyzer": "spanish"
          }
        }
      },
      {
        "en": {
          "match": "*",
          "match_mapping_type": "string",
          "mapping": {
            "type": "text",
            "analyzer": "english"
          }
        }
      }
    ]
  }
}

POST my_index_dynamic/_doc
{
  "title": "This is a title",
  "title_es": "Este es un titulo"
}

GET my_index_dynamic/_mapping

# Default mapping: indices contain only one type of document

# index Aliases

PUT my_index_v1
PUT my_index_v1/_alias/my_index_as_seen_by_application

# which index the alias is pointing to: 
GET /*/_alias/my_index_as_seen_by_application

# which aliases point to an index
GET my_index_v1/_alias/*

