# Distributed search execution

# SEE: https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html#scroll-search-results

POST gb-tweet/_search?scroll=1m
{
  "query": {
    "match_all": {}
  },
  "size": 1
}

POST _search/scroll
{
  "scroll": "1m",
  "scroll_id": "FGluY2x1ZGVfY29udGV4dF91dWlkDXF1ZXJ5QW5kRmV0Y2gBFjJLVkdkd0ZqU2l5V1laRU56UzdQYlEAAAAAAAACwRZrcmdtTDlBZlRCbXJ0RmxGOXY3b2ZB"
}

# For pagination: use Point In Time (PIT) plus search_after
# SEE: https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html#search-after 