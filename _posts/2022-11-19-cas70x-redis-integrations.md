---
layout:     post
title:      Apereo CAS - Redis All The Things
summary:   Learn about available integrations strategies that allow Apereo CAS to use Redis behind the scenes to manage application registration records, tokens, consent decisions, terms of use policies, etc.
tags:       ["CAS 7.0.x", "Redis"]
---

[Redis](https://redis.io) is an open-source, in-memory data store that can act as a database, cache, streaming engine, and message broker. Apereo CAS offers several extension modules that allow a CAS deployer to take advantage of a Redis database to manage CAS tokens, application registration records, and more. 

{% include googlead1.html %}

In this post, we will briefly take a look at some of the available options that allow for a seamless integration between Apereo CAS and Redis. This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Attribute Consent

CAS provides the ability to enforce [user-informed consent](https://apereo.github.io/cas/7.0.x/integration/Attribute-Release-Consent.html) upon attribute release. Practically, this means that before accessing the target application, the user will be presented with a collection of attributes allowed to be released to the application with options to either proceed or deny the release of said attributes. There are also additional options to indicate how should underlying changes in the attribute release policy be considered by the consent engine.
{% include googlead1.html %}
User consent decisions and options can of course be managed and stored inside a [Redis database](https://apereo.github.io/cas/7.0.x/integration/Attribute-Release-Consent-Storage-Redis.html). A super modest setup should include the following settings:

```properties
cas.consent.redis.host=localhost
cas.consent.redis.port=6379
```

# Terms of Use

Also known as *Acceptable Usage Policy* or EULA, CAS presents the ability to allow the user to accept [the usage policy](https://apereo.github.io/cas/7.0.x/webflow/Webflow-Customization-AUP.html) before moving on to the application. Production-level deployments of this feature typically would want to allow CAS to store the user policy decisions inside an external database such as Redis.

A basic setup may include the following settings:
{% include googlead1.html %}
```properties
cas.acceptable-usage-policy.redis.host=localhost
cas.acceptable-usage-policy.redis.port=6379
cas.acceptable-usage-policy.core.aup-attribute-name=accepted
```

The `aup-attribute-name` is somewhat important; This is the principal attribute to choose in order to determine whether or not the policy has been accepted. The attribute is expected to contain a boolean value where `true` indicates policy has been accepted and `false` indicates otherwise. The attribute is fetched for the principal from configured attribute sources and compared for the right match to determine policy status. If the attribute is not found, the policy status is considered as not accepted.

# Ticketing

Redis can be used as the backend store to manage CAS-generated tokens. The Redis ticket registry provided by CAS would use Redis as a key/value store that accepts ticket identifiers as the key and CAS-produced ticket objects as values. 

Assuming you have the correct [extension module](https://apereo.github.io/cas/7.0.x/ticketing/Redis-Ticket-Registry.html) defined in your CAS overlay, the basic setup should be as follows:
{% include googlead1.html %}
```properties
cas.ticket.registry.redis.host=localhost
cas.ticket.registry.redis.port=6379
```

It's often considered a recommended practice to allow CAS to sign and encrypt tokens that are stored in an external database. For Redis, this would mean the following settings should be included in your CAS settings:

```properties
cas.ticket.registry.redis.crypto.enabled=true
cas.ticket.registry.redis.crypto.encryption.key=...
cas.ticket.registry.redis.crypto.signing.key=...
```
{% include googlead1.html %}
If you don't have the keys immediately available, CAS would generate those for you and output those in the logs after your first attempt. Copy/paste from the logs as necessary.

The Redis ticket registry layers an in-memory cache on top of Redis to assist with performance, particularly when it comes to fetching ticket objects from Redis. Each cache inside an individual CAS server node will attempt to synchronize ticket changes and updates with other CAS server nodes via a message-based mechanism backed by Redis itself. In doing so, you may wish to identify each CAS server node in the communication queue using a unique identifier:

```properties
# Choose another identifier for other CAS server nodes...
cas.ticket.registry.redis.queue-identifier=cas-node-1
```
{% include googlead1.html %}
Of course, if you want to disable the cache altogether you may do so using the following:

```properties
cas.ticket.registry.redis.cache.cache-size=0
```

# Application Registration

Similar to ticket operations, application registration records can be stored inside a Redis database. Again, CAS presents and uses Redis as a key/value store where the key is the application identifier and CAS service definition objects are put inside Redis as values. 

A [modest setup](https://apereo.github.io/cas/7.0.x/services/Redis-Service-Management.html) should include the following settings:
{% include googlead1.html %}
```properties
cas.service-registry.redis.host=localhost
cas.service-registry.redis.port=6379
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html