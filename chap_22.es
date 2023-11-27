GET _cat/allocation?v=true
GET _cat/indices 

DELETE my_index
PUT my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_analyzer": {
          "type": "standard",
          "stopwords": [
            "and",
            "the"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "my_analyzer",
  "text": ["The quick and the dead"]
}