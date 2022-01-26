# Basic Document search
#######################

GET /_search

GET /gb-tweet,us-tweet/_search

GET /gb-*,us-*/_search


# Offset pagination
GET /_search
{
  "size": 1,
  "from": 0
}

GET /_search?size=1&from=0

# Search Lite
GET /gb-tweet,us-tweet/_search?q=tweet:elasticsearch

# Search Lite
# each condition is "must", so in form of: +<field>:<value>
# query: need to compose query as AND (+) of two conditions
# encoding:
#   + -> %2B
#   : -> %3A
# +name:john AND  +tweet:mary
GET /gb-tweet,us-tweet/_search?q=%2Bname%3Ajohn+%2Btweet%3Amary

# equivalent, but filling parameters in JSON body 
GET /gb-tweet,us-tweet/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "name": "john" } },
        { "term": { "tweet": "mary"} }
      ]
    }
  }
}

# - name field contains mary OR john: +name:(mary+john)
# - date greater than 2014-09-10: +date:>2014-09-10
# - any field contains aggregations OR geo: +(aggregations+geo)
# encoding:
#   + -> %2B
#   : -> %3A
#   > -> %3E
GET /gb-*,us-*/_search?q=%2Bname%3A(mary+john)+%2Bdate%3A%3E2014-09-10+%2B(aggregations+geo)

# UTILS
##########

GET _cat/indices/gb-*,us-*

DELETE us-tweet,us-user,gb-tweet,gb-user