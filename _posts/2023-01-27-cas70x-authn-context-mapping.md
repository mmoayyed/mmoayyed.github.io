---
layout:     post
title:      Apereo CAS - Mapping Authentication Contexts
summary:   Learn how to translate and map requested authentication contexts from one protocol to another, and route the final flow to multifactor authentication if necessary.
tags:       ["CAS 7.0.x", "SAML", "Delegated Authentication", "OpenID Connect"]
---

Most authentication protocols have a concept for requested authentication context. This is typically a method or form of authentication that the identity provider should fullfill and satisfy either in addition to or instead of the usual authentication strategy. For example, the identity provider might be asked to prompt for multifactor authentication after the initial credential validation, or it may be asked to use something stronger and more secure than username/password authentication. Parties involved in the authentication flow will need to agree upon the meanings of the values used, which may be context-specific. 

{% include googlead1.html %}

In this post, we will briefly take a look at a few configuration options that allow CAS to translate and map requested authentication contexts. This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `17`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Use Cases

Let's go over a couple of commons scenarios.

## Multifactor Authentication

Let's say that you have a CAS deployment that is configured to act as an OpenID Connect identity provider. This CAS server is also configured to use Google Authenticator for multifactor authentication. Then, relying parties that are registered with CAS are configured to request `https://refeds.org/profile/mfa` as the requested authentication context, and we would then need to translate this so that such requests are also put through a multifactor authentication flow:

```properties
cas.authn.oidc.core.authentication-context-reference-mappings=https://refeds.org/profile/mfa->mfa-gauth
```

This exact scenario would just as equally apply, if your CAS server is configured to act as a SAML2 identity provider. We still need to translate these requests to activate a multifactor authentication flow:

```properties
cas.authn.saml-idp.core.authentication-context-class-mappings=https://refeds.org/profile/mfa->mfa-gauth
```

## Delegation & Proxying

Let's say that you have a CAS deployment that is configured to act as a SAML2 identity provider. This CAS sever is also configured to act as a SAML2 proxy, and will hand off authentication requests to an external SAML2 identity provider, say, Okta. In other words, all applications registered with CAS will interact with it as a SAML2 identity provider, and yet CAS itself will act as a service provider when it proxies the request to Okta.

SAML2 service provicers that are registered with CAS are configured to request `https://refeds.org/profile/mfa` as the requested authentication context. Normally, CAS would take the context verbaitm and will pass it on to Okta. Of course, Okta may not recognize this context at all, and so you may be required to translate and map this to something it understands:

```
cas.authn.saml-idp.core.authentication-context-class-mappings[0]= \
    https://refeds.org/profile/mfa->http://schemas.example.com/claims/multipleauthn
```

You can translate `https://refeds.org/profile/mfa` to more than one authentication context, if necessary:

```
cas.authn.saml-idp.core.authentication-context-class-mappings[0]= \
    https://refeds.org/profile/mfa->http://schemas.example.com/c1,http://schemas.example.com/c2
```

Once the flow has returned from Okta, CAS would validate and parse the SAML2 response that is found by Okta. It would then extract the satisfied authentication context from the response, and will record it under a special attribute when it builds its single sign-on session:

```properties
cas.authn.mfa.core.authentication-context-attribute=authnContext
```

Finally, when CAS begins to build its SAML2 response for the SAML2 service provider, it will use what was satisfied and the mapping rules defined to communicate the authentication context back to the application. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html