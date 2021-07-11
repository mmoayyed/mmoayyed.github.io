---
layout:     post
title:      Apereo CAS - RESTful Delegated Authentication
summary:    Learn how to use an external REST API to outsource the construction and configuration of external delegated identity providers.
tags:       [CAS]
---

Apereo CAS has had support to delegate authentication to [external identity providers][delegation] for quite some time. Of course, *delegation* is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate identity provider endpoint, and on the return trip back, CAS is tasked to shake hands, parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. 

In this blog post, we will briefly review the configuration required to outsource the construction and configuration of external delegated identity providers to a REST API and have CAS dynamically picked up the REST payload to identity providers available for authentication. 

{% include googlead1.html  %}

Our starting position is as follows:

- CAS `6.4.x`
- Java `11`

# Configuration

In its most basic form, the location of the external REST API would be taught to CAS using the following settings:

```properties
cas.authn.pac4j.rest.url=https://custom.api.org/delegatedauthn
```

We could also teach CAS to cache the response payload from the REST API for better performance:

```properties
cas.authn.pac4j.rest.cache-duration=PT1H
```

{% include googlead1.html  %}

This would CAS to only reach out to the REST API when the contents of cache expire i.e. once every 2 hours. This cache expiration policy of course does directly correlate with how quickly you would like to see changes picked up by CAS and how rapidly you plan on adding, removing, or updating the external identity providers that are managed by the REST API. 

<div class="alert alert-info">
<strong>Use</strong><br/>Note that the internal state of the cache is not distributed and is only kept inside a single CAS server node's runtime memory. This implies if you are running CAS in a cluster, each node could potentially contain differing copies of the cache, depending on the cache bootstrapping and initialization timeline.</div>

# REST Payload

The payload exchanged between CAS and the external REST API is controlled using [the pac4j library](http://www.pac4j.org/docs/config-module.html). For now, our REST API is only going to present a single identity provider that is yet another CAS server:

```json
{
  "callbackUrl": "https://localhost:8443/cas/login",
  "properties": {
    "cas.protocol": "CAS20",
    "cas.loginUrl": "https://sso.example.com/cas/login"
  }
}
```

# Custom Strategies

If you wish to design a custom strategy that would feed your external identity providers to CAS for delegation, you could certainly design your implementation using the following construct:

{% include googlead1.html  %}

```java
@Bean
public DelegatedClientFactory pac4jDelegatedClientFactory() {
    return ...
}
```

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[delegation]: https://apereo.github.io/cas/development/integration/Delegate-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html