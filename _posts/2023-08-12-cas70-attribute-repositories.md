---
layout:     post
title:      Apereo CAS - Customizing Attribute Repositories
summary:    Learn how to build or customize sources of person attributes through attribute repositories and the Person Directory project.
tags:       ["CAS 7.0.x", "Gradle", "Spring Boot", "Attribute Resolution"]
---

[Attribute resolution strategies](https://apereo.github.io/cas/development/integration/Attribute-Resolution.html) in CAS are controlled by the [Person Directory project](https://github.com/apereo/person-directory). The Person Directory dependency is automatically bundled with the CAS server and provides several options to fetch attributes and user data from sources such as LDAP, JDBC, etc. Since we do have multiple sources of attributes, the Person Directory component is also able to aggregate and merge the results and has options to decide how to deal with disagreements in case two sources produce conflicting data.

{% include googlead1.html  %}

In this post, we will demonstrate how attribute repositories in CAS can be customized and rebuilt. Our starting position is:

- CAS `7.0.x`
- Java `21`

# Attribute Repository Plan

Attribute repositories in Apereo CAS are often an implementation of the `IPersonAttributeDao` interface that is backed and provided by the Person Directory project. These implementations are first constructed as conditional Spring `@Bean` definitions. All such beans are eventually and at runtime collected, sorted, filtered, and registered into the overall *attribute resolution plan*.

A typical attribute repository implementation that talks to multiple data sources may be modeled as:
{% include googlead1.html %}
```java
@Bean
public BeanContainer<IPersonAttributeDao> myRepositories() {
    var list = new ArrayList<IPersonAttributeDao>();
    list.add(new MyFancyPersonAttributeDao());
    list.add(new MySimplePersonAttributeDao());
    return BeanContainer.of(list);
}
```

Once you have the bean definition ready, it's then time to register it into the plan:
{% include googlead1.html %}
```java
@Bean
public PersonDirectoryAttributeRepositoryPlanConfigurer myRepositoryPlan(
    @Qualifier("myRepositories")
    final BeanContainer<IPersonAttributeDao> stubAttributeRepositories) {
    return plan -> {
        plan.registerAttributeRepositories(myRepositories.toList());
    };
}
```

# Attribute Caching

Attributes that are fetched from all attribute repositories and data sources are typically attached to the single sign-on session as the first caching layer. A second-level internal cache also exists that controls the fetching policy and behavior of attributes. In simple terms, the attribute fetching logic is as follows:

1. Look for an existing single sign-on session and reuse attributes attached to the authenticated subject from that session.
2. ...or, look into the internal second-level cache to find attributes for user `xyz`. 
3. ...or, contact attribute repositories to fetch attributes for user `xyz` and cache the results.

The second-level cache can be controlled via:
{% include googlead1.html %}
```properties
cas.authn.attribute-repository.core.expiration-time=5
cas.authn.attribute-repository.core.expiration-time-unit=seconds
```

...or you may completely replace the responsible bean with your implementation via:

```java
@Bean
public IPersonAttributeDao cachingAttributeRepository() {}
```

# Static Attributes

Oftentimes, it proves helpful to put together custom attributes whose value is statically defined. Such attributes can be defined globally, which means they are resolved and built once and are subsequently available for release to all applications. This option works best for static attributes that tend to be globally unique or those that can be shared with all applications without prejudice:

```properties
cas.authn.attribute-repository.stub.attributes.organization=Example Company
```

Alternatively, the same thing may be achieved on a per-application basis, allowing each service provider to receive the same attribute name with a different value. This option works best if you need to maintain the same attribute naming convention while isolating the logic that builds the final value.
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "^https://app.example.org",
  "name" : "My Application",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class": "org.apereo.cas.services.ReturnStaticAttributeReleasePolicy",
    "allowedAttributes": {
      "@class": "java.util.LinkedHashMap",
      "organization": [ "java.util.ArrayList", [ "Example Company" ] ]
    }
  }
}
```

You can do the same thing with an embedded Groovy script:
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "^https://app.example.org",
  "name" : "My Application",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class": "org.apereo.cas.services.ReturnMappedAttributeReleasePolicy",
    "allowedAttributes": {
      "@class": "java.util.LinkedHashMap",
      "uid" : "groovy { return 'Example Company' }"
    }
  }
}
```

# Static JSON Attributes

CAS does support an attribute repository implementation that is backed by a JSON file. This option provides a bit more flexibility in that the backing file is watched and reloadable, and the store in general can mimic a real attribute store to a degree and produce attributes for unique users. The structure of the JSON file is as follows:
{% include googlead1.html %}
```json
{
  "user1": {
    "employeeNumber": [
      "123456"
    ],
    "nickname": [
      "Bob"
    ]
  },
  "user2": {
    "employeeNumber": [
      "123456"
    ],
    "nickname": [
      "Bob"
    ]
  }
}
```

This option works best for static attributes that can be attached to individual users.

As ever, you can also replace this option with your implementation by taking inspiration from `JsonBackedComplexStubPersonAttributeDao`:
{% include googlead1.html %}
```java
@Bean
public BeanContainer<IPersonAttributeDao> jsonAttributeRepositories() {}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html