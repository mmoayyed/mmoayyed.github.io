---
layout:     post
title:      Apereo CAS - Delegated Authentication & Groovy Attribute Extraction
summary:    Learn how to delegate and hand off authentication to an external OAuth20-capable identity provider, and script the extraction of attributes from the identity provider response using Groovy.
tags:       ["CAS 6.5.x", "Delegated Authentication", "Groovy"]
---

When setting up Apereo CAS to delegate authentication to [external identity providers][delegation], it may be desirable to manipulate the claims and attributes received from the identity provider to transform values from one syntax to another. For example, an identity provider might return the attribute `employeeId` with the value of `EMPL-123456` back to CAS whereupon custom extraction logic would capture that attribute value as `123456` instead, and would record it under a new name, `employeeReference` to be used for release to client applications.

{% include googlead1.html  %}

In this blog post, we will take a look at strategies to hand off the authentication flow to an external OAuth20 identity provider and to script the extraction of attributes from the response. 

Our focus is based on the following:

- CAS `6.5.x`
- Java `11`

## Configuration

Once you have prepared your CAS build for [delegated authentication][delegation], the basic configuration requires to hand off authentication to an external OAuth20 provider is as follows:

{% include googlead1.html  %}

```
cas.authn.pac4j.oauth2[0].auth-url=https://accounts.example.com/o/oauth2/v2/auth
cas.authn.pac4j.oauth2[0].token-url=https://oauth2.example.com/token
cas.authn.pac4j.oauth2[0].profile-url=https://oauth2.example.com/userinfo
cas.authn.pac4j.oauth2[0].profile-verb=GET
cas.authn.pac4j.oauth2[0].id=860891691795.example.com
cas.authn.pac4j.oauth2[0].secret=b5lNXps
cas.authn.pac4j.oauth2[0].client-name=OAUTH
cas.authn.pac4j.oauth2[0].scope=scope1 scope2
```

Furthermore, we should instruct CAS to fetch and capture our attributes from the user profile:

{% include googlead1.html  %}
```
cas.authn.pac4j.oauth2[0].profile-attrs.phone=phone
cas.authn.pac4j.oauth2[0].profile-attrs.home-address=address
```

## Attribute Conversion

As it stands out, delegated authentication and attribute extraction in CAS is handled by the [Pac4j][pac4j] library, which provides a flexible way for us to collect attributes from the response. For example, in its simplest form we could instruct CAS to capture the attribute `phone` from the profile and record it under the same name:

{% include googlead1.html  %}

```
cas.authn.pac4j.oauth2[0].profile-attrs.phone=phone
```

There are also built-in attribute converters that operate on specific value patterns. For example, we could instruct CAS to capture the attribute `locale` and parse/record it under `loc` as a `java.util.Locale` object:

```
cas.authn.pac4j.oauth2[0].profile-attrs.locale=Locale|loc
```
{% include googlead1.html  %}
There are many other built-in attribute converters available, such as `Url`, `Color`, `Date`, `Gender`, etc.

## Scripting Attribute Conversions

Back to our original use case, let's say the identity provider provides the attribute `employeeId` with the value of `EMPL-123456`. We'd want to convert that value to `123456` instead, and record it under `employeeReference`. To achieve this, CAS provides a specific `AttributeConverter` component that can operate on *inline, embedded Groovy* scripts. Here's an example:

{% include googlead1.html  %}

```
cas.authn.pac4j.oauth2[0].profile-attrs.employeeId=\
    groovy { return attribute.toString().replace('EMPL-', '') }|employeeReference
```

The `attribute` variable is the actual attribute value, linked to `employeeId`, and is picked by the [Pac4j][pac4j] and passed down to the Groovy script. The resulting value is then captured and recorded under `employeeReference`.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[pac4j]: https://github.com/pac4j/pac4j
[delegation]: https://apereo.github.io/cas/6.5.x/integration/Delegate-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html