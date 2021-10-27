---
layout:     post
title:      Apereo CAS - Attribute Resolution Lifecycle States
summary:    Learn how to define attribute repositories to resolve person attributes, on-demand or conditionally, by taking advantage of repository and resolver lifecycle states to enable, disable the resolution engine, or put it in standby mode.
tags:       [CAS]
---

The attribute resolution engine in Apereo CAS has grown to be quite flexible over the years and can locate people and attributes from a variety of sources. The resolution engine is primarily tasked to resolve and canonicalize principal identifiers using *principal resolver* components, and then locate claims and attributes for those identifiers from sources using *attribute repository* components.

{% include googlead1.html  %}

In this blog post, we will take a look at ways attribute repository components can be configured and conditioned in Apereo CAS. Our starting position is as follows:

- CAS `6.5.x`
- Java `11`

## Active Attribute Repositories

By default, attribute repositories registered in the CAS configuration are treated as enabled, and they are registered in the overall resolution plan, ready to process requests. For example, we could define two attribute repositories to work together as such:

{% include googlead1.html  %}

```
cas.authn.attribute-repository.stub.id=Static
cas.authn.attribute-repository.stub.order=0
cas.authn.attribute-repository.stub.attributes.display-name=Misagh Moayyed
cas.authn.attribute-repository.stub.attributes.cn=Misagh

cas.authn.attribute-repository.groovy[0].id=Groovy
cas.authn.attribute-repository.groovy[0].order=1
cas.authn.attribute-repository.groovy[0].location=file:///path/to/repository.groovy
```

{% include googlead1.html  %}

When the resolution engine is invoked, the final result would be a combination of values from both repositories.

## Inactive Attribute Repositories

Sometimes, it's helpful and convenient to disable a repository block; you'd want CAS to parse and load the repository settings, but not necessarily use the actual component for principal resolution and instead use custom logic and code to handle that bit yourself. So, rather than commenting out and removing the configuration block, the repository itself can be disabled:

{% include googlead1.html  %}

```
cas.authn.attribute-repository.stub.id=Static
cas.authn.attribute-repository.stub.order=0
cas.authn.attribute-repository.stub.attributes.display-name=Misagh Moayyed
cas.authn.attribute-repository.stub.attributes.cn=Misagh

cas.authn.attribute-repository.groovy[0].id=Groovy
cas.authn.attribute-repository.groovy[0].order=1
cas.authn.attribute-repository.groovy[0].location=file:///path/to/repository.groovy

cas.authn.attribute-repository.stub.state=DISABLED
cas.authn.attribute-repository.groovy[0].state=DISABLED
```
{% include googlead1.html  %}

When the resolution engine is invoked, it would be as if those repository blocks defined in the configuration do not exist. However, you will still be able to parse and read those blocks in custom code via a `CasConfigurationProperties` type of object.

## Stand-by Attribute Repositories

An attribute repository can also be put into standby mode; this means the repository configuration is processed and registered into the application runtime and is effectively available as a Spring `@Bean`. However, it is not registered into the resolution plan and can only be called and invoked explicitly when needed. 

{% include googlead1.html  %}

For example, we can put the `Static` attribute repository into standby mode, and only use its functionality in our `Groovy` attribute repository instead:

```properties
cas.authn.attribute-repository.stub.state=STANDBY
```

Since the `Static` attribute repository is available in the Spring application context, we can fetch and invoke it ourselves in the Groovy script:

```groovy
import org.apereo.cas.util.spring.*

def Map<String, Object> run(final Object... args) {
    def username = args[0]
    def attributes = args[1]
    def logger = args[2]
    def properties = args[3]
    def appContext = args[4]

    def stubRepository = appContext.getBean("stubAttributeRepositories", 
        BeanContainer.class).toList()[0]

    def person = stubRepository.getPerson("casuser")
    def results = ["username": ["casuser"]]
    results.putAll(person.getAttributes())
    logger.info("Final attributes are ${results}")
    return results
}
```

{% include googlead1.html  %}

Our Groovy script can reuse and recycle the results of the `Static` attribute repository, and then implement its custom processing on top of it, without having to recreate and duplicate the logic of the `Static` repository.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html