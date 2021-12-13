# Basic document insertion
##########################

PUT /website/_doc/123
{
  "title": "My first blog entry",
  "text": "Just trying this out...",
  "date": "2014/01/01"
}

POST /website/_doc/
{
  "title": "My second blog entry",
  "text": "Still trying this out...",
  "date": "2014/01/01"
}

GET /website/_doc/123

GET /website/_doc/123?_source=title,text

GET /website/_doc/123/_source

HEAD /website/_doc/123

PUT /website/_doc/123
{
  "title": "My first blog entry",
  "text": "I'm starting to get the hang of this...",
  "date": "2014/01/02"
}

PUT /website/_doc/124?op_type=create
{
  "title": "My third blog entry",
  "text": "ABC...",
  "date": "2014/01/03"
}

PUT /website/_create/125
{
  "title": "My fourth blog entry",
  "text": "DEF...",
  "date": "2014/01/04"
}

# Optimistic concurrency control
################################
# see: https://www.elastic.co/guide/en/elasticsearch/reference/current/optimistic-concurrency-control.html

PUT /website/_create/1
{
  "title": "I will change this",
  "text": "DEF...",
  "date": "2014/01/04"
}

GET /website/_doc/1

PUT /website/_doc/1?if_seq_no=6&if_primary_term=1
{
  "title": "I'm changing this",
  "text": "DEF...",
  "date": "2014/01/04"
}

PUT /website/_doc/2?version=5&version_type=external
{
  "title": "My first external blog entry",
  "text": "Starting to get the hang of this..."
}

PUT /website/_doc/2?version=10&version_type=external
{
  "title": "My first external blog entry",
  "text": "This is a piece of cake..."
}

# Partial updates
#################

GET /website/_doc/1

POST /website/_update/1
{
  "doc":{
    "tags": ["testing"],
    "views": 0
  }
}

POST /website/_update/1
{
  "script": "ctx._source.views+=1"
}

POST /website/_update/1
{
  "script": {
    "lang": "painless",
    "source": "ctx._source.tags.add(params.new_tag)",
    "params": {
      "new_tag": "search"
    }
  }
}

POST /website/_update/1
{
  "script": {
    "lang": "painless",
    "source": "ctx.op = ctx._source.views == params.count ? 'delete' : 'none'",
    "params": {
      "count" : 1
    }
  }
}

PUT /website/_create/3
{
  "title": "Counting",
  "text": "DEF...",
  "date": "2014/01/04"
}

# possibly not existing document
POST /website/_update/4
{
  "script": {
    "source": "ctx._source.views+=1",
    "lang": "painless"
  },
  "upsert": {
      "views": 1
  }
}

# possibly not existing document, with possibly not existing field
POST /website/_update/5
{
  "script": {
    "source": "if( ctx._source.containsKey(\"views\") ) {ctx._source.views+=1} else { ctx._source.views = 1; }",
    "lang": "painless"
  },
  "upsert": {
      "views": 1
  }
}

# retry on conflicts
POST /website/_update/4?retry_on_conflict=5
{
  "script": {
    "source": "ctx._source.views+=1",
    "lang": "painless"
  },
  "upsert": {
      "views": 1
  }
}

GET /website/_doc/4

# Retrieving Multiple Documents
###############################

GET /_mget
{
  "docs": [
    {
      "_index": "website",
      "_id": 2
    },
    {
      "_index": "website",
      "_id": 3,
      "_source" : "views"
    }
  ]
}

GET website/_doc/_mget
{
  "docs": [
    {
      "_id": 2
    },
    {
      "_id": 3
    }
  ]
}

GET website/_doc/_mget
{
  "ids": [ 2, 3 ]
}

GET website/_doc/_mget
{
  "ids": [ 2, 7 ]
}

# Bulk actions
##############

POST /_bulk
{"delete": {"_index": "website", "_id": "123"}}
{"create": {"_index": "website", "_id": "123"}}
{"title": "Bulk update: a post"}
{"index": {"_index": "website"}}
{"title": "Bulk update: a second post"}
{"update": {"_index": "website", "_id": "123", "retry_on_conflict": 5}}
{"doc": {"title": "Update a post"}}

GET /website/_search
{
  "query": {
    "term": {
      "title.keyword":  "Bulk update: a second post"
    }
  }
}

POST /website/_doc/_mget
{
  "ids": [123, "cK-2sn0BEuaQhtNh6W5M"]
}

POST website/_doc/_bulk
{"delete": {"_id": "123"}}
{"create": {"_id": "123"}}
{"title": "Bulk update: a post"}
{"index": {}}
{"title": "Bulk update: a second post"}
{"update": {"_id": "123", "retry_on_conflict": 5}}
{"doc": {"title": "Update a post"}}


# UTILS
#######
GET _cat/indices

GET /website/_search
{
  "query": {
    "match_all": {
      
    }
  }
}

GET website/_count

DELETE /website/_doc/3

DELETE website