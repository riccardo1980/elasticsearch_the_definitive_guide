# Standard analyzer

POST _analyze
{
  "analyzer": "standard",
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}

POST _analyze
{
  "tokenizer": "standard",
  "filter": ["lowercase"],
  "text": "The 2 QUICK Brown-Foxes jumped over the lazy dog's bone."
}

## standard Tokenizer

GET /_analyze
{
  "tokenizer": "whitespace",
  "text": "You're the 1st runner home!"
}

GET /_analyze
{
  "tokenizer": "letter",
  "text": "You're the 1st runner home!"
}

GET /_analyze
{
  "tokenizer": "standard",
  "text": "You're my 'favorite'"
}

GET /_analyze
{
  "tokenizer": "standard",
  "text": "You're my 'favorite': joe-bloggs@foo-bar.com"
}

GET /_analyze
{
  "tokenizer": "uax_url_email",
  "text": "You're my 'favorite': joe-bloggs@foo-bar.com"
}


## Installing the ICU Plug-in
# make sure you are using modified image, see es-plugin-docker-compose folder

GET _cat/plugins

# Thai
GET _analyze
{
  "tokenizer": "standard",
  "text": "สวัสดี ผมมาจากกรุงเทพฯ"
}

GET _analyze
{
  "tokenizer": "icu_tokenizer",
  "text": "สวัสดี ผมมาจากกรุงเทพฯ"
}

# Chinese
GET _analyze
{
  "tokenizer": "standard",
  "text": "向日葵"
}

GET _analyze
{
  "tokenizer": "icu_tokenizer",
  "text": "向日葵"
}

# different scripts
GET _analyze
{
  "tokenizer": "standard",
  "text": "βeta"
}

GET _analyze
{
  "tokenizer": "icu_tokenizer",
  "text": "βeta"
}

# Tidying Up Input Text
## Tokenizing HTML

GET _analyze
{
  "tokenizer": "standard",
  "text": """
  <p>Some d&eacute;j&agrave; vu <a href="http://somedomain.com>">website</a>
  """
}

GET _analyze
{
  "tokenizer": "standard",
  "char_filter": ["html_strip"],
  "text": """
  <p>Some d&eacute;j&agrave; vu <a href="http://somedomain.com>">website</a>
  """
}


PUT my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_html_analyzer": {
          "tokenizer": "standard",
          "char_filter": [
            "html_strip"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "my_html_analyzer",
  "text": """
  <p>Some d&eacute;j&agrave; vu <a href="http://somedomain.com>">website</a>
  """
}

## Tidying up punctuation
DELETE my_index

PUT my_index
{
  "settings": {
    "analysis": {
      "char_filter": {
        "quotes": {
          "type": "mapping",
          "mappings": [
            "\u0091=>\u0027",
            "\u0092=>\u0027",
            "\u2018=>\u0027",
            "\u2019=>\u0027",
            "\u201B=>\u0027"
          ]
        }
      },
      "analyzer": {
        "quotes_analyzer": {
          "tokenizer": "standard",
          "char_filter": [
            "quotes"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "analyzer": "quotes_analyzer",
  "text": "You’re my ‘favorite’ M‛Coy"
}


GET my_index/_analyze
{
  "analyzer": "quotes_analyzer",
  "text": "You\u2019re my \u2018favorite\u2019 M\u201BCoy"
}