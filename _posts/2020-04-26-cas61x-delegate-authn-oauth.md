---
layout:     post
title:      Apereo CAS - Delegated Authentication to OAUTH Identity Providers
summary:    Learn how your Apereo CAS deployment may be configured to delegate authentication to an external OAUTH identity provider.
tags:       [CAS]
---

Apereo CAS has had the support to [delegate authentication to external OAUTH identity providers](https://apereo.github.io/cas/6.1.x/integration/Delegate-Authentication.html) for quite some time. This functionality, if memory serves me correctly, started around CAS `3.x` as an extension based on the [pac4j](https://github.com/pac4j/pac4j) project which then later found its way into the CAS codebase as a first-class feature. Since then, the functionality more or less has evolved to allow the adopter less configuration overhead and fancier ways to automated workflows.

{% include googlead1.html  %}

Of course, *delegation* is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate SAML2 endpoint and on the return trip back, CAS is tasked to parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. In other words, in delegated scenarios, the main identity provider is an external system and CAS simply begins to act as a client or *proxy* in between.

In the most common use case, CAS is made entirely invisible to the end-user such that the redirect simply happens automatically, and as far as the audience is concerned, there are only the external identity provider and the target application that is, of course, prepped to speak the CAS protocol.

In this short tutorial, we are briefly going to review the specifics of this matching strategy and ways that it might be customized. Our starting position is based on:

- CAS `6.1.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)


## Configuration

The initial setup is in fact simple; as the [documentation describes](https://apereo.github.io/cas/6.1.x/integration/Delegate-Authentication.html) you simply need to add the required dependency in your overlay:

```xml
<dependency>
  <groupId>org.apereo.cas</groupId>
  <artifactId>cas-server-support-pac4j-webflow</artifactId>
  <version>${cas.version}</version>
</dependency>
```

...and then in your `cas.properties`, instruct CAS to hand off authentication to the OAUTH identity provider:

```
cas.authn.pac4j.principalAttributeId=id

cas.authn.pac4j.oauth2[0].authUrl=...
cas.authn.pac4j.oauth2[0].tokenUrl=...
cas.authn.pac4j.oauth2[0].profileUrl=...
cas.authn.pac4j.oauth2[0].profileVerb=GET

cas.authn.pac4j.oauth2[0].profileAttrs.phone=phone
cas.authn.pac4j.oauth2[0].profileAttrs.id=id
cas.authn.pac4j.oauth2[0].profileAttrs.homeAddress=address

cas.authn.pac4j.oauth2[0].id=...
cas.authn.pac4j.oauth2[0].secret=...
cas.authn.pac4j.oauth2[0].scope=https://example.org/scope

cas.authn.pac4j.oauth2[0].clientName=OAUTH
```

The above settings instruct CAS to:

- Define specific users for the OAUTH identity provider's authorization, token and user-info endpoints.
- Describe and map the set of profile attributes that would be returned to CAS via the user-info endpoint.
- Define the client id, client secret, and scope for the OAUTH identity provider.
- Establish a CAS authenticated user (i.e. `Principal`) with an identifier that is mapped to the `id` attribute returned from the OAUTH provider.

{% include googlead1.html  %}

The following is an example of what we expect from the user-info endpoint based on the above configuration:

```json
{
    "id": "user",
    "username": "user",
    "gender": "male",
    "phone": "1234567890",
    "homeAddress": "1234 Main Street"
}
```

That should be all. 


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Finally, if you benefit from Apereo CAS as free and open-source software, we invite you to [join the Apereo Foundation](https://www.apereo.org/content/apereo-membership) and financially support the project at a capacity that best suits your deployment. If you consider your CAS deployment to be a critical part of the identity and access management ecosystem and care about its long-term success and sustainability, this is a viable option to consider.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
