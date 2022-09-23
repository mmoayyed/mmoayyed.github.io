---
layout:     post
title:      Apereo CAS - SSO Session Management
summary:    Learn how to control and manage single sign-on sessions in Apereo CAS and tune session timeouts for the betterment of all mankind.
tags:       ["CAS 6.6.x", "Authentication"]
---

One of the most important and perhaps most popular features of Apereo CAS is its ability, as an identity provider, to provide single sign-on. This is a technique and authentication strategy that allows one to log in once to any of several related and yet independent applications and not be asked for credentials over and over. In this blog post, I will go over the basics of the problem statement as well as a few nuances that one should consider when it comes to managing the single sign-on session, timeouts, etc.

This post specifically requires and focuses on:

- CAS `6.6.x`
- Java `11`

# Overview

The authentication workflow for many applications today can be categorized and labeled as *Multi Sign-on*. This is the scenario where there is no central identity provider, and each application uniquely presents some sort of login form and authentication strategy. This is typically a problematic setup because not only each application presents a different user experience for authentication, but also the user is forced to provide their credentials multiple times for each application. What is worst is that the end user might end up with many different types of accounts and credentials for applications and each application directly gets access to and can see the user's password. 

Apereo CAS, as an identity provider capable of providing single sign-on, provides a solution to this problem that can be described using the below image: 

{% include image.html img="https://user-images.githubusercontent.com/1205228/190636699-da1a7a7b-2476-437f-a1d2-43c3ce5513e0.png" 
width="70%" title="Apereo CAS as an Identity Provider with SSO" %}

The following characteristics are worth noting here:

1. Client applications no longer ask the user for credentials. Rather, they will redirect the user to the identity provider that would take on the task of receiving and validating user credentials.
2. In doing so, client applications may *speak* to the identity provider using any of the standard authentication protocols such as OpenID Connect, SAML2, etc.
3. The identity provider is the only entity that receives user credentials and typically is the only system that has access to the user/account store to verify user identity and fetch profiles, attributes, etc.
4. Once the end-user establishes a session with the identity provider, the user identity is then remembered and stored by the identity provider for a configurable period known as the *SSO Session Timeout*. During this special window, the user will typically not be asked to present some type of credential again until/unless special requirements force the user to do so.

# Highlights

If you agree with the basic premise of single sign-on, then you would do well to remember the following highlights:

- Single sign-on sessions are entirely separate from the choice of authentication protocol. No matter what *language* is chosen by the client application to speak to the identity provider, the single sign-on session that is established will remain valid for as long as allows in all future authentication requests from client applications. 
- Neither LDAP nor Active Directory are identity providers.
- Apereo CAS, among other identity providers in the same space, is **NOT** a session manager. The single sign-on session managed by CAS is entirely separate from the client application session and managing that is the responsibility of the application. 

# SSO Session Timeout

Apereo CAS links the single sign-on session with the user's browser using a special cookie called `TGC`. This is an HTTP cookie set by CAS upon the establishment of a single sign-on session. This cookie maintains the login state for the client, and while it is valid, the client browser can present it to CAS in place of primary credentials. The cookie value is linked to the user's authentication record internally tracked by the server, the remote IP address that initiated the request as well as the user agent that submitted the request. The final cookie value is then **encrypted and signed**.

The default SSO session timeout for CAS can be managed globally using the following properties:

```properties
cas.ticket.tgt.primary.max-time-to-live-in-seconds=PT8H
cas.ticket.tgt.primary.time-to-kill-in-seconds=PT2H
```

This will allow CAS to keep the SSO session alive for a total of 8 hours while allowing a 2-hour inactivity period in that window. Inactivity in this context means the CAS server is sitting idle and is not using, validating, or otherwise processing the established SSO session in any way, even when the user might be active in some client application.

The expiration policy of SSO sessions can be conditionally decided on a per-application basis. The candidate service whose SSO expiration policy is to deviate from the default configuration must be designed as such:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "Example",
  "id" : 1,
  "ticketGrantingTicketExpirationPolicy": {
    "@class": "org.apereo.cas.services.DefaultRegisteredServiceTicketGrantingTicketExpirationPolicy",
    "maxTimeToLiveInSeconds": 5
  }
}
```

Remember that applications are responsible to manage their session. CAS will not and cannot manage the application session and generally has no control over the application’s timeout policies, logout practices, etc. The expiration policy of the SSO session per application allows CAS to use that policy as an override and separate from the global defaults, at the time the SSO is constructed and only if the incoming service request matches that given registered service definition. Once created, the policy remains global and affects all other applications and it has nothing to do with how the application manages its sessions.

Of course, if you do not want to support single sign-on at all, you can turn off SSO altogether:

```properties
cas.sso.sso-enabled=false
```

You also have the option to disable SSO on a per-application basis. The following example demonstrates such a policy for an application that is registered and integrated with CAS:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "Example",
  "id" : 1,
  "accessStrategy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
    "ssoEnabled" : false
  }
}
```

# Final Thoughts

Remember that the creation of an SSO session is entirely separate and has nothing to do with the authentication protocol used to establish said session. Regardless of the type of exchange between the client application and the CAS server, an SSO session will be created, used, maintained, and shared between all application types that are integrated with CAS, regardless of their type or requested protocol.

Finally, a reminder that CAS is not an application session manager in that it is the responsibility of the applications to maintain and control their own application sessions. Once authentication is completed, CAS is typically out of the picture in terms of the application sessions. Therefore, the expiration policy of the application session itself is entirely independent of CAS and may be loosely coordinated and adjusted depending on the ideal user experience if the application session expires.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html