# Full-Body Search
##################

GET gb-tweet/_mapping

# mails that 
# contain "business opportunity" AND ( starred OR ( in inbox AND not spam ) )
#
GET gb-tweet,us-tweet/_search
{
  "query":{
    "bool":{
      "must": { "match": {"email": "business opportunity" }},
      "should": [
        { "match": {"starred": "true" }},
        { "bool": {
            "must": {"match":{"folder": "inbox"}},
            "must_not": {"match":{"spam": "true"}}
        }}
      ],
      "minimum_should_match": 1
    }
  }
}

# term filter: for exact values
# "Avoid using the term query for text fields"
# see: https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html
# TL;DR: 
# Term query does not analyze search term, it searches for exact match. Instead, text field is analyzed.

GET gb-tweet/_search
{
  "query": {
    "term": {
      "name.keyword": {
        "value": "Mary Jones"
      }
    }
  }
}

# range filter
GET gb-tweet/_search
{
  "query": {
    "range": {
      "date": {
        "gte": "2013-09-15",
        "lte": "2014-09-15"
      }
    }
  }
}

# match query: 
# on text field -> fulltext
# on keyword field -> exact match
GET gb-tweet/_search
{
  "query": {
    "match": {
      "tweet": "elasticsearch means"
    }
  }
}

# bool query: to combine multiple queriy clauses
GET gb-tweet,us-tweet/_search
{
  "query": {
    "bool":{
      "must": { "match": {"tweet": "elasticsearch" }},
      "must_not": { "match": {"name": "mary" }},
      "should": { "match": {"tweet": "full text" }}
    }
  }
}

# Filtering a Query
# filtered query is replaced by bool
# See: https://www.elastic.co/guide/en/elasticsearch/reference/6.8/query-dsl-filtered-query.html
# See also: https://www.elastic.co/guide/en/elasticsearch/reference/current/filter-search-results.html

GET gb-tweet,us-tweet/_search
{
  "query": {
    "bool": {
      "must": { "match": { "tweet": "elasticsearch" }},
      "filter": { "term": {"name.keyword": "Mary Jones"}}
    }
  }
}

# Book example should now read:
GET /_search
{
    "query": {
        "bool": {
            "must": { "match": { "email": "business opportunity" }},
            "filter": { "term": { "folder": "inbox" }}
        }
    }
}

###########################
# A FILTER IN QUERY CONTEXT
###########################
# In a query context, you can match all results (score will be equal for all documents)
# - explicit: insert a "must":{ "match_all": {}} clause [score will be 1.0]
# - implicit: use only "filter" clause in "bool" compound query clause [score will be 0.0]
GET /_search
{
    "query": {
        "bool": {
            "must": { "match_all": {}},
            "filter": { "term": { "folder": "inbox" }}
        }
    }
}

GET gb-tweet,us-tweet/_search
{
  "query": {
    "bool": {
      "must": { "match_all": {}},
      "filter": { "term": {"name.keyword": "Mary Jones"}}
    }
  }
}

###########################
# A QUERY IN FILTER CONTEXT
###########################

GET gb-tweet,us-tweet/_search
{
  "query": {
    "bool": {
      "filter": {
        "bool": {
          "must": { "term": { "name.keyword": "Mary Jones" }},
          "must_not" : { "match": { "tweet": "powerful elasticsearch" }}
        }
      }
    }
  }
}

# Validating queries:
# - validate
# - get an optional explanation (even for valid queries)

GET gb-tweet,us-tweet/_validate/query?explain
{
  "query": {
    "tweet" : {
      "match" : "really powerful"
    }
  }
}


GET gb-tweet,us-tweet/_validate/query?explain
{
  "query": {
    "bool": {
      "must": [
        {"match": { "tweet": "DSL" }},
        {"match_phrase": { "tweet": "really powerful" }}
      ] 
    }
  }
}


# UTILS
##########

GET _cat/indices

GET *-tweet/_mapping

GET _cluster/health