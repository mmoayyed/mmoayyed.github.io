---
layout:     post
title:      Apereo CAS - Delegated Authentication with Microsoft Azure AD B2C
summary:    Learn how to use Microsoft Azure AD B2C as an external OpenID Connect identity provider and connect it to CAS for a delegated/proxy authentication scenario.
tags:       [CAS]
---

Apereo CAS has had support to delegate authentication to [external OpenID Connect identity providers][oidc] for quite some time. This functionality, if memory serves me correctly, started around CAS 3.x as an extension based on the [pac4j project](https://github.com/pac4j/pac4j) which then later found its way into the CAS codebase as a first-class feature. Since then, the functionality more or less has evolved to allow the adopter less configuration overhead and fancier ways to automated workflows.

Of course, *delegation* is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate identity provider endpoint, and on the return trip back, CAS is tasked to shake hands, parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. In other words, in delegated scenarios, the main identity provider is an external system and CAS simply begins to act as a client or proxy in between.

In this blog post, we will start from a modest OpenID Connect client application that is integrated with CAS and will be using [Azure Active Directory B2C](https://docs.microsoft.com/en-us/azure/active-directory-b2c/) as our external OpenID Connect identity provider to accommodate the following authentication flow:

{% include googlead1.html  %}

{% include image.html img="https://user-images.githubusercontent.com/1205228/121808669-df509080-cc6e-11eb-8642-2e1d4dee0e4e.jpg" 
width="70%" title="CAS Login Flow" %}

- User accesses the OpenID Connect client application.
- User is redirected to CAS, acting as an OpenID Connect identity provider.
- CAS, acting as a client itself, lets the user delegate the flow to Azure Active Directory B2C.
- User logs in using Azure Active Directory B2C credentials and is redirected back to CAS.
- CAS establishes an SSO session and redirects the user back to the OpenID Connect client application.
- OpenID Connect client application shakes hands with CAS and allows the user to log in.

Our starting position is as follows:

- CAS `6.4.x`
- Java `11`

## Configuration

Once you have the correct modules in the WAR overlay for [OpenID Connect][oidc] and [Delegated Authentication][delegation], you will need to make sure CAS can hand off authentication to the Azure Active Directory B2C identity provider:

```
cas.authn.pac4j.oidc[4].generic.id=...
cas.authn.pac4j.oidc[4].generic.secret=...
cas.authn.pac4j.oidc[4].generic.client-name=AzureB2CClient
cas.authn.pac4j.oidc[4].generic.discovery-uri=https://login.microsoftonline.com/\
  <identifier>/v2.0/.well-known/openid-configuration
cas.authn.pac4j.oidc[4].generic.scope=openid,profile,email
cas.authn.pac4j.oidc[4].generic.principal-attribute-id=email
```

{% include googlead1.html  %}

The discovery URI can be found on the Azure Active Directory B2C dashboard for your tenant:

{% include image.html img="https://user-images.githubusercontent.com/1205228/121808891-d3190300-cc6f-11eb-8b5c-8c50e40667a0.png"
width="70%" title="Azure Active Directory B2C Discovery URI" %}


Remember that you need to register the CAS Redirect URI with Azure Active Directory B2C. By default, the redirect (reply) URI is the
CAS login endpoint which contains the name of the external identity provider as a path variable:

{% include image.html img="https://user-images.githubusercontent.com/1205228/121808763-4ec68000-cc6f-11eb-9e24-42876db1cc12.png"
width="80%" title="Azure Active Directory B2C Redirect/Reply URI" %}

{% include googlead1.html  %}

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[delegation]: https://apereo.github.io/cas/6.4.x/integration/Delegate-Authentication.html
[oidc]: https://apereo.github.io/cas/6.4.x/integration/Delegate-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html