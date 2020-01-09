---
layout:     post
title:      Apereo CAS - Event Filtering
summary:    Learn how to filter events that are tracked by CAS event repositories and persistence engine.
tags:       [CAS]
background: '/images/home/slide-1.jpg'
---

# Overview

CAS provides a facility for consuming and [recording authentication events](https://apereo.github.io/cas/development/installation/Configuring-Authentication-Events.html) into persistent storage. Events are primarily designed to be consumed by the developer and subsequent CAS modules and track a variety of types throughout the CAS lifecycle. While by default, all events are loaded and persisted in the underlying storage, there may be scenarios where one would prefer to dynamically filter out certain events. This quick blog posts demonstrates a strategy to activate event filtering in CAS.

Our starting position is based on:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

In order to design an event filter, you should start by [designing your own configuration component](https://apereo.github.io/cas/development/configuration/Configuration-Management-Extensions.html) to include the following bean:

```java
@Bean
public CasEventRepositoryFilter casEventRepositoryFilter() {
    var resource = new ClassPathResource("GroovyCasEventRepositoryFilter.groovy");
    return new GroovyCasEventRepositoryFilter(resource);
}
```

We are outsourcing the event filtering task to a Groovy script whose responsibility to determine if events quality for storage, etc. The outline of the script itself should match the below example:

```groovy
def shouldSaveEvent(Object[] args) {
    def event = args[0]
    def logger = args[1]

    logger.debug("Decide whether ${event} should be saved...")
    /*
    Return true if event should be saved.
    Otherwise, return false.
    */
    true
}
```

The callback in the above Groovy script is invoked before the event is saved to determine the eligibility criteria. The script receives a `event` object of type `CasEvent` and a `logger` that could be used to output messages to the configured CAS log.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
