---
layout:     post
title:      Apereo CAS - Handling SAML2 Authentication Requests
summary:    Learn how to manage SAML2 authentication requests when CAS is acting as a SAML2 identity provider in single-node and multi-node deployments.
tags:       [CAS]
---

Apereo CAS presents itself as a multilingual platform supporting protocols such as CAS, SAML2, OAuth2, and OpenID Connect. Support and functionality for each protocol are designed and implemented using a plugin model where each protocol effectively becomes a client of the CAS server, handing off matters of authentication and workflows, and eventually then takes back control to build the appropriate response using its specific bindings, parameters, payload and security requirements. A blog post on how this model works can be found [here](/2018/02/26/cas-delegation-protocols/) or [here](/2017/02/17/cas-custom-protocols/).

{% include googlead1.html  %}

This post specifically focuses on the SAML2 identity provider plugin in CAS and how it receives, tracks, and manages authentication requests in single-node and multi-node environments. Our starting position is as follows:
 
- CAS `6.3.x`
- Java `11`

# Single-Node

By default, a SAML2 authentication request is stored in the servlet container's HTTP session. Whether you're using an embedded or external servlet container, the key requirement is to make sure the session timeout policy is long and flexible enough to handle scenarios where the login sequence may be delayed. The delay could be caused by the user taking time to provide input or could be caused by an external system connected to CAS that is not as responsive. 

In the event that a SAML2 authentication request cannot be found in the appropriate session container, you might see the following error messages pop up:

{% include googlead1.html  %}

```bash
java.lang.IllegalArgumentException: SAML request could not be determined from the authentication request 
    at AbstractSamlIdPProfileHandlerController.retrieveSamlAuthenticationRequestFromHttpRequest(AbstractSamlIdPProfileHandlerController.java:155) 
    at SSOSamlIdPProfileCallbackHandlerController.handleCallbackProfileRequest(SSOSamlIdPProfileCallbackHandlerController.java:88) 
    at GeneratedMethodAccessor341.invoke(Unknown Source) 
    at DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
    ...
```

This issue can generally be duplicated using the following sequence:

* User starts with the application and initiates the login sequence.
* A SAML2 authentication request is sent to CAS. CAS presents the login form.
* User waits for a few minutes, and then enters credentials.
* The above error is produced.

{% include googlead1.html  %}

So, the issue has to do with the fact that:

- The SAML request is stored in the HTTP session.
- The session is available and around for X number of seconds.
- User waits `X + 1` seconds, exceeding that timeout window.
- When CAS resumes, it wants to find that SAML request to move forward and yet it's gone.

## Embedded Servlet Container

A good initial change would be to adjust the session timeout in the CAS configuration. Note that this change is only applicable if you are using an embedded servlet container with CAS, regardless of its type:

{% include googlead1.html  %}
```properties
server.servlet.session.timeout=PT300S
```

## External Servlet Container

The solution here very much depends on the time of the external servlet container. For instance, Apache Tomcat generally has a session timeout of 30 minutes, which might be more than sufficient to prevent this type of error. Nonetheless, the session timeout can be adjusted by modifying the Apache Tomcat's `web.xml` file typically at `/opt/tomcat/conf/web.xml`:

{% include googlead1.html  %}
```xml
<session-config>
    <!-- Value is set in minutes. -->
    <session-timeout>5</session-timeout>
</session-config>
```

# Multi-Node

If you have multiple CAS servers deployed behind a load balancer or a proxy, you generally need to mak sure *Sticky Sessions* are turned on and configured at the load balancer level, in addition to carefully managing the session timeouts. Alternatively, you may force force the CAS server to handle session replication itself via the ticket registry using `cas.authn.saml-idp.replicate-sessions=true`.

{% include googlead1.html  %}

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html