---
layout:     post
title:      Apereo CAS - Azure Active Directory Authentication
summary:   Learn about available integration strategies that allow Apereo CAS to use Azure Active Directory as an authentication and attribute source.
tags:       ["CAS 7.0.x", "Azure Active Directory"]
---

[Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/fundamentals/active-directory-whatis) (Azure AD) is Microsoft’s cloud-based identity and access management service. Apereo CAS allows one to authenticate credentials using Azure Active Directory as the account store and optionally fetch user attributes using Microsoft Graph. This integration is now supported for public as well as confidential clients.

{% include googlead1.html %}

In this post, we will briefly take a look at a few configuration options that allow CAS to use Azure Active Directory as an authentication source. This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- [Azure Active Directory Integration](https://apereo.github.io/cas/7.0.x/authentication/Azure-ActiveDirectory-Authentication.html)

# Authentication

CAS uses the new [Microsoft Authentication Library (MSAL)](https://github.com/AzureAD/microsoft-authentication-library-for-java) to use Azure Active Directory as an authentication and account store. This library allows CAS to sign in users or apps with Microsoft identities (Azure AD, Microsoft accounts, and Azure AD B2C accounts) and obtain tokens to call Microsoft APIs. It is built using industry-standard OAuth2 and OpenID Connect protocols.
{% include googlead1.html %}
Authentication support in CAS is available for public and confidential client applications.

## Public Applications

Apps in this category, like the following types, always sign in users:

- Desktop apps that call web APIs on behalf of signed-in users
- Mobile apps
- Apps running on devices that don't have a browser, like those running on IoT

Assuming you have prepared your CAS WAR overlay with the correct extension module, the following settings would allow CAS to obtain an access token from Azure AD and authenticate users for a public client application:
{% include googlead1.html %}
```properties
cas.authn.azure-active-directory.login-url=https://login.microsoftonline.com/common/

cas.authn.azure-active-directory.client-id=12345-bc3b-1234-1234-bf6c7ded8b7e
cas.authn.azure-active-directory.tenant=abcdefg-1ee3-487d-b39f-abcdefg
```

You will need to adjust the `client-id` and the `tenant` settings of course.

## Confidential Applications

Apps in this category include:

- Web apps that call a web API
- Web APIs that call a web API
- Daemon apps, even when implemented as a console service like a Linux daemon or a Windows service

Assuming you have prepared your CAS WAR overlay with the correct extension module, the following settings would allow CAS to obtain an access token from Azure AD and authenticate users for a public client application:
{% include googlead1.html %}
```properties
cas.authn.azure-active-directory.login-url=https://login.microsoftonline.com/common/

cas.authn.azure-active-directory.client-id=12345
cas.authn.azure-active-directory.client-secret=12345
cas.authn.azure-active-directory.tenant=abcdefg
```

You will need to adjust the `client-id`, `client-secret` and the `tenant` settings of course. The main difference, as you might note, is the addition of the `client-secret` setting.

## Principal Transformation

Typically, usernames submitted to Azure Active Directory need to be scoped to a particular domain, i.e. `@onmicrosoft.com`. You can transform usernames automatically such that when the end-user submits their username/password to CAS (i.e. `casuser` and `Mellon`), CAS would automatically append the domain to the username prior to submission, freeing the user from doing so. 
{% include googlead1.html %}
```properties
cas.authn.azure-active-directory.principal-transformation.suffix=@domain.com
```

# Attributes

A successful authentication attempt using Azure Active Directory attempts to fetch user profiles and attributes from Microsoft Graph automatically. However, you may have scenarios where your authentication source might be separate and different, i.e. a REST API, and yet you would still want to fetch attributes from Azure Active Directory. Since authentication and attribute sources in CAS are conceptually and practically different components, we can configure CAS to separately use Azure Active Directory as an attribute source only:
{% include googlead1.html %}
```
cas.authn.attribute-repository.azure-active-directory[0].client-id=1234567
cas.authn.attribute-repository.azure-active-directory[0].client-secret=Qo43Q~NbOE
cas.authn.attribute-repository.azure-active-directory[0].tenant=123456
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html