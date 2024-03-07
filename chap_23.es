DELETE my_index
PUT my_index 
{
  "settings": {
    "analysis": {
      "filter": {
        "my_synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "british,english",
            "queen,monarch"
          ]
        }
      },
      "analyzer": {
        "my_synonyms": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "my_synonym_filter"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "text": ["Elizabeth is the English queen"],
  "analyzer": "my_synonyms"
}

## Formatting synonyms
DELETE my_index
PUT my_index 
{
  "settings": {
    "analysis": {
      "filter": {
        "my_synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "u s a,united states, united states of america=>usa",
            "g b,gb,great britain=>britain,england,scotland,wales"
          ]
        }
      },
      "analyzer": {
        "my_synonyms": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "my_synonym_filter"
          ]
        }
      }
    }
  }
}

GET my_index/_analyze
{
  "text": ["Biden is the president of the united states"],
  "analyzer": "my_synonyms"
}

## Expand or contract
# Simple expansion: "jump,hop,leap"
# Simple contraction: "leap,hop=>jump"
# Generic Expansion: "<WORD>=>WORD,GENERIC_1", need to apply at index time

## Case sensitive synonyms

DELETE my_index
PUT my_index 
{
  "settings": {
    "analysis": {
      "filter": {
        "case_sensitive_synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "CAT,CAT scan=>cat_scan",
            "PET,PET scan=>pet_scan",
            "pet scan=>pet_scan"
          ]
        },
        "case_insensitive_synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "cat=>cat,pet",
            "dog=>dog,pet",
            "cat scan=>cat_scan",
            "pet scan=>pet_scan"
          ]
        },
        "robust_case_insensitive_synonym_filter": {
          "type": "synonym",
          "synonyms": [
            "cat=>cat,pet",
            "dog=>dog,pet",
            "cat scan,cat_scan scan=>cat_scan",
            "pet scan,pet_scan scan=>pet_scan"
          ]
        }
      },
      "analyzer": {
        "case_sensitive_synonyms": {
          "tokenizer": "standard",
          "filter": [
            "case_sensitive_synonym_filter"
          ]
        },
        "case_insensitive_synonyms": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "case_insensitive_synonym_filter"
          ]
        },
        "robust_case_insensitive_synonyms": {
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "robust_case_insensitive_synonym_filter"
          ]
        }
      }
    }
  }
}

# need to treat the same pet scan, PET scan, PET
GET my_index/_analyze
{
  "text": ["Need a pet scan"],
  "analyzer": "case_sensitive_synonyms"
}

GET my_index/_analyze
{
  "text": ["Need a PET scan"],
  "analyzer": "case_sensitive_synonyms"
}

GET my_index/_analyze
{
  "text": ["Need a PET"],
  "analyzer": "case_sensitive_synonyms"
}

###############
# need to distinguish PET from pet
GET my_index/_analyze
{
  "text": ["Need a PET"],
  "analyzer": "case_sensitive_synonyms"
}

GET my_index/_analyze
{
  "text": ["Need a pet"],
  "analyzer": "case_sensitive_synonyms"
}

###############
# in the case insensitive, I need to map pet scan, PET scan in pet_scan
GET my_index/_analyze
{
  "text": ["Need a pet scan"],
  "analyzer": "case_insensitive_synonyms"
}

GET my_index/_analyze
{
  "text": ["Need a PET scan"],
  "analyzer": "case_insensitive_synonyms"
}

GET my_index/_analyze
{
  "text": ["Need a pet"],
  "analyzer": "case_sensitive_synonyms"
}

## WARNING: can't grasp the need of the robust version