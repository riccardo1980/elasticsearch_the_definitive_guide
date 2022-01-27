# Mapping and Analysis
#######################

# FURTHER INFO:
# - Removal of string type
#   - https://www.elastic.co/blog/strings-are-dead-long-live-strings

GET gb-*,us-*/_search?q=date:2014-09-15

GET gb-*,us-*/_search?q=does

GET /gb-tweet/_mapping
GET /gb-user/_mapping

POST _analyze
{
  "analyzer": "standard",
  "text":     "Set the shape to semi-transparent by calling set_trans(5)"
}

POST _analyze
{
  "analyzer": "simple",
  "text":     "Set the shape to semi-transparent by calling set_trans(5)"
}

POST _analyze
{
  "analyzer": "whitespace",
  "text":     "Set the shape to semi-transparent by calling set_trans(5)"
}

POST _analyze
{
  "analyzer": "english",
  "text":     "Set the shape to semi-transparent by calling set_trans(5)"
}

# change analyzer of "tweet" from default to english: can not!
# I can use instead a subfield, with a new analyzer
PUT /gb-tweet/_mapping
{
  "properties": {
    "tweet": {
      "type": "text",
      "fields": {
        "en": {
          "type": "text",
          "analyzer": "english"
        }
      }
    }
  }
}

# Testing the analyzers

# default
POST /gb-tweet/_analyze
{
  "field": "tweet", 
  "text": "The brown fox jumped over the lazy dog"
}

# not analyzed for .keyword subfield
POST /gb-tweet/_analyze
{
  "field": "tweet.keyword", 
  "text": "The brown fox jumped over the lazy dog"
}

# english analyzer for .en subfield
POST /gb-tweet/_analyze
{
  "field": "tweet.en", 
  "text": "The brown fox jumped over the lazy dog"
}



# UTILS
##########

GET _cat/indices/gb-*,us-*

DELETE us-tweet,us-user,gb-tweet,gb-user