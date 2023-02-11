---
layout:     post
title:      Hazelcast Query API & Attribute Value Extraction
summary:    Learn how to extend the Hazelcast Query API with custom attributes that may be referenced in predicates, queries, and indexes.
tags:       ["Hazelcast", "Miscellaneous"]
---

Hazelcast provides a Predicates API as a programming interface for querying data in Hazelcast maps. This API can accept SQL-like queries that can be used to fetch or locate data in Hazelcast maps. In this post, we will focus on how the Hazelcast query language may be extended to allow for querying custom attributes inside a Java-based entity that stores data inside a `HashMap`.

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- Hazelcast `5.2.x`
- Java 17

# Use Case

The Hazelcast Predicates SQL API generally has the following structure:

```java
var query = "...";
var results = hazelcastMapInstance.values(Predicates.sql(query));
```
{% include googlead1.html  %}
Furthermore, let's consider that entities and objects that are stored inside our `hazelcastMapInstance` are represented using the following data model:

```java
class Model {
    private Map<String, List<String>> attributes = new HashMap<>();
}
```

Our SQL statement should return results for the following query:

> Find all `Model` objects in the Hazelcast map that have an entry with the key `uid` whose values may contain `test`.
{% include googlead1.html  %}

In a sense, our SQL query should be able to support the following syntax:

```java
var query = "attributes[uid] IN ('test')";
var results = hazelcastMapInstance.values(Predicates.sql(query));
```

# Hazelcast ValueExtractor

To extract a custom attribute, that is `attributes[uid]`, we should take advantage of `com.hazelcast.query.extractor.ValueExtractor`. Our implementation should encompass the extraction logic to look for a custom argument inside the map, capture its values and pass those back to Hazelcast's value collector. 
{% include googlead1.html  %}
```java
@Override
public void extract(final Model model,
                    final String attributeName,
                    final ValueCollector valueCollector) {
    var values = model.getAttributes().get(attributeName);
    if (values != null) {
        valueCollector.addObject(new MultiResult<>(values));
    }
}
```

We should also of course register our extractor with Hazelcast:
{% include googlead1.html  %}
```java
var attributeConfig = new AttributeConfig();
attributeConfig.setName("attributes");
attributeConfig.setExtractorClassName("...");

var mapConfig = new MapConfig();
mapConfig.addAttributeConfig(attributeConfig);
```

Keep in mind that an extractor may not be added after the map has been instantiated. All extractors have to be defined upfront in the map’s initial configuration.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html