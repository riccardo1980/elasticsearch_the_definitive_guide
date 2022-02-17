# Sorting and Relevance
#######################


GET gb-tweet,us-tweet/_search
{
  "query": {
    "bool": {
      "filter": { "term": {"user_id": 1}}
    }
  },
  "sort": [ {"date": {"order": "desc"}}
  ]
}


# UTILS
##########

GET _cat/indices

GET *-tweet/_mapping

GET _cluster/health