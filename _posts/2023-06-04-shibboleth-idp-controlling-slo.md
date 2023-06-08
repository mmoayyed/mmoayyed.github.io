---
layout:     post
title:      Shibboleth Identity Provider - Controlling Single Logout
summary:    Review configuration options available in the Shibboleth Identity Provider that allow one to manage single logout operations.
tags:       ["Shibboleth Identity Provider"]
---

Controlling the single logout process in the Shibboleth Identity Provider generally includes the following operations:

- HTTP GET request is made to the `/profile/Logout` endpoint
- The IdP session is ended.
- The IdP lists all services accessed during the IdP session, if tracked, and offers to end those sessions by propagating a logout message to each one.

{% include googlead1.html %}

In this post, we will briefly look at options that allow one to control the single logout process in the Shibboleth Identity Provider. Our starting position is as follows:

- Shibboleth Identity Provider `4.3.x`
- Java `11`

# Configuration

If you need to disable single logout altogether in the Shibboleth Identity Provider, the following properties need to be set: 

```properties
idp.session.trackSPSessions = false
idp.session.secondaryServiceIndex = false
```
{% include googlead1.html %}
This will deactivate SLO for all applications registered with the IdP. 

The `idp.session.trackSPSessions` property controls the SLO propagation feature to different applications that are tracked in the IdP session. Note that the IdP session is always terminated regardless of the user's choice to propagate logout requests.

# SLO for CAS Relying Parties

If your Shibboleth IdP supports and has turned on CAS protocol support, you also have the option to selectively include certain CAS applications from SLO propagation operations. For CAS protocol services to participate in SLO, the `singleLogoutParticipant` attribute must be set to true in the service definitions that identify the service:
{% include googlead1.html %}
```xml
<bean class="net.shibboleth.idp.cas.service.ServiceDefinition"
      c:regex="https://([A-Za-z0-9_-]+\.)*example\.org(:\d+)?/.*"
      p:singleLogoutParticipant="true" />
```

The above setting is off by default and it is only set to `true` if you do so explicitly. In other words, CAS applications are by default excluded from SLO unless you actively configure and update the service definition to include them in propagation operations.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to engage and contribute as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
