---
layout:     post
title:      Apereo CAS - Controlling SAML2 Authentication Context Classes
summary:    Learn how to define and dynamically control the SAML2 AuthnContext attribute in the final SAML2 response, globally or per SAML2 service provider.
tags:       ["CAS 7.2.x", "SAML", "Groovy"]
---

In SAML 2.0, the `AuthnContext` element typically indicates the level of assurance provided by the identity provider (CAS) during the authentication process. This sometimes includes the strength and type of authentication, such as multifactor authentication, which then allows the SAML2 service provider to evaluate the assurance of the authentication provided by CAS. Authentication contexts typically are defined as *categories* or *classes*. Some standard examples might be: `urn:oasis:names:tc:SAML:2.0:ac:classes:Password`, `https://refeds.org/profile/mfa`, or `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport`, etc. This class value is included in the final SAML2 response, usually in the following format:
{% include googlead1.html  %}
```xml
...
<saml2:AuthnStatement AuthnInstant="2024-11-22" 
                      SessionIndex="..." 
                      SessionNotOnOrAfter="2024-11-22">
    <saml2:AuthnContext>
        <saml2:AuthnContextClassRef>
            https://refeds.org/profile/mfa
        </saml2:AuthnContextClassRef>
    </saml2:AuthnContext>
</saml2:AuthnStatement>
...
```

In this post, we will review the available options in CAS that would allow one to control the SAML2 authentication context class and decide the attribute value based on service providers or other dynamic aspects of the authentication event. This post requires and focuses on:

{% include googlead1.html  %}
- CAS `7.2.x`
- Java `21`

# Multifactor Authentication

This is a rather common use case that requires one to assign a specific authentication context class based on the condition that the user was put through a multifactor authentication flow. For example, you may decide that the appropriate class should be `https://refeds.org/profile/mfa` but only if and when the user can successfully pass through a multifactor authentication scenario such as Duo Security. This is achievable via the following construct:
{% include googlead1.html  %}
```properties
cas.authn.saml-idp.core.context.authentication-context-class-mappings=\
    https://refeds.org/profile/mfa->mfa-duo
```

If user fails to satisfy that condition, the chosen authentication context class would instead turn into `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport`. You can also control the default fallback option via the following setting:
{% include googlead1.html  %}
```properties
cas.authn.saml-idp.core.context.default-authentication-context-class=...
```

# SAML2 Service Provider

This is the scenario that gives you complete control over the chosen authentication context class for a specific SAML2 service provider. With this option, you get to directly and explicitly choose a context class value and instruct the system to include that in the SAML2 response, regardless of what else may or could have happened. This is possible by adjusting the application registration record:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "https://sp.example.org",
  "name" : "Sample",
  "id" : 1,
  "metadataLocation" : "/path/to/sp/metadata",
  "requiredAuthenticationContextClass": "https://refeds.org/profile/mfa"
}
```
{% include googlead1.html  %}
Again, this option does not take into account any other conditions, and the decision is only effective when CAS evaluates the requirements for **this** service provider. 

# Dynamic Context Classes

The following use case combines the previous two and allows you to control the authentication context class for a SAML2 service provider dynamically based on certain conditions. For example, you might want the context class to be `https://refeds.org/profile/mfa` but only when the user is able to successfully complete a multifactor authentication flow. Otherwise, the context class should be `http://schemas.example.com/claims/helloworld.` We want these decisions to only affect our service provider in question, leaving everything else aside.

To handle this, we need to find a way to examine the authentication context delivered by CAS and make decisions. This can be done inside the application registration policy:
{% include googlead1.html  %}
```
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "https://sp.example.org",
  "name" : "Sample",
  "id" : 1,
  "metadataLocation" : "/path/to/sp/metadata",
  "requiredAuthenticationContextClass":
    '''
    groovy {
        def assertion = context.authenticatedAssertion.get()
        logger.info("Authenticated assertion is ${assertion}")
        /*
            Examine assertion.attributes and make decisions.
            Then return the final chosen context value.
        */
        return "..."
    }
    '''
}
```

Or if you prefer, you could move the logic into a standalone external file:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "https://sp.example.org",
  "name" : "Sample",
  "id" : 1,
  "metadataLocation" : "/path/to/sp/metadata",
  "requiredAuthenticationContextClass": "file:/path/to/script.groovy"
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you, and I am sure that both this post and the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
