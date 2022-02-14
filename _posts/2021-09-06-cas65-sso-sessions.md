---
layout:     post
title:      Apereo CAS - Managing SSO Sessions
summary:    A quick review of how to manage and administer single sign-on sessions in Apereo CAS via dedicated endpoints, to view and delete active user sessions.
tags:       ["CAS 6.5.x", "Monitoring"]
---

As an identity provider and single sign-on manager, Apereo CAS is able to manage and maintain the collection of active single sign-on sessions for users. Furthermore, administers are able to review all active sessions and remotely destroy a user's single sign-on session, effectively logging the user out of all applications via single logout if that is an activated option. 

{% include googlead1.html  %}

This blog post presents an overview single sign-on management facilities in CAS, via the following starting position:

- CAS `6.5.x`
- Java `11`
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)

# SSO Sessions

Administrative management of CAS single sign-on sessions is provided via a dedicated `ssoSessions` endpoint:

```properties
management.endpoints.web.exposure.include=ssoSessions
management.endpoint.ssoSessions.enabled=true

cas.monitor.endpoints.endpoint.ssoSessions.access=IP_ADDRESS
cas.monitor.endpoints.endpoint.ssoSessions.required-ip-addresses=127.0.0.1
```

{% include googlead1.html  %}

This *actuator* endpoint allows one to fetch all single sign-on sessions with the given type. Some sessions are directly established with CAS and some are created via [proxy authentication][casprotocol]. What's important here is that this endpoint requires that the underlying ticket registry and store is able to store, maintain and return a collection tickets that represent the single sign-on session. You will **NOT** be able to collect and review sessions, if the ticket registry does not have this capability.

Let's play around with this a bit.

## Retrieving SSO Sessions

Fetch all active SSO sessions:

```bash
curl -X GET https://sso.example.org/cas/actuator/ssoSessions | jq
```

Fetch all active SSO sessions for a single user:

{% include googlead1.html  %}

```bash
curl -X GET https://sso.example.org/cas/actuator/ssoSessions\?username\=casuser | jq
```

## Removing SSO Sessions

Destroy a single active SSO session:

```bash
curl -X DELETE https://sso.example.org/cas/actuator/ssoSessions/TGT-1-g2tM-TMc  | jq
```

Destroy all active SSO sessions for a given user:

{% include googlead1.html  %}

```bash
curl -X DELETE https://sso.example.org/cas/actuator/ssoSessions\?username\=casuser | jq
```

Destroy all active SSO sessions:

```bash
curl -X DELETE https://sso.example.org/cas/actuator/ssoSessions\?type\=ALL | jq
```

{% include googlead1.html  %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[casprotocol]: https://apereo.github.io/cas/6.5.x/protocol/CAS-Protocol.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html