---
layout:     post
title:      Apereo CAS - Delegated Authentication & Identity Provider Auto Redirection
summary:    Learn how to present external identity providers to Apereo CAS for delegated (proxy) authentication, and choose strategies that allow the system to automatically redirect the user to it for authentication and access.
tags:       ["CAS 6.6.x", "Delegated Authentication", "SAML"]
---

When setting up Apereo CAS to delegate authentication to [external identity providers][delegation], one common consideration is to determine whether requests sent to the identity provider should be made manually or automatically and to evaluate the user experience for each case. There are at least three options to consider here: 

1. Allow the user to make the selection manually.
2. Redirect automatically via the browser, with appropriate messaging on the screen that instructs the user to wait while the flow is being redirected to an external website.
3. Redirect automatically to the identity provider via the server, effectively turning CAS into an *invisible* proxy.

{% include googlead1.html  %}

In this blog post, we will briefly review the configuration required to redirect to delegated identity providers and ways we can modify the system to handle automatic redirects.

Our starting position is as follows:

- CAS `6.6.x`
- Java `11`

# Initial Setup

Let's start with the basic premise that our CAS server is prepped for [external (delegated) authentication][delegation] and that our external identity provider is Azure Active Directory with which we shall interact via the SAML2 protocol:

```
cas.authn.pac4j.saml[0].keystore-password=...
cas.authn.pac4j.saml[0].private-key-password=...
cas.authn.pac4j.saml[0].service-provider-entity-id=https://sso.example.org/cas/samlsp
cas.authn.pac4j.saml[0].service-provider.file-system.location=/etc/cas/config/sp-metadata.xml
cas.authn.pac4j.saml[0].keystore-path=/etc/cas/config/samlKeystore.jks
cas.authn.pac4j.saml[0].identity-provider-metadata-path=https://login.microsoftonline.com/...
cas.authn.pac4j.saml[0].client-name=SAML2Client
```

Now, let's decide how to redirect to Azure AD. 

# User Selection

The default configuration and setup always allow the user to make the selection from a menu:

{% include image.html img="https://user-images.githubusercontent.com/1205228/236603016-0eb47930-d429-4d87-8b0a-261d9ef95453.png" width="70%" title="Apereo CAS - Delegated Authentication & Identity Provider Auto Redirection" %}

This is useful in scenarios where you want to present all authentication options to the user.

# Browser (Client) Redirects

It is possible to also instruct CAS to *automatically* redirect to Azure AD. The browser could be instructed to execute the redirect, allowing the user the visibility to see the redirect with a little bit of visual clue and instructive text, i.e. *Please wait while we redirect you...*. This option can be achieved by the following setting:

```
cas.authn.pac4j.saml[0].auto-redirect-type=CLIENT
```

# Server Redirects

The opposite option is also possible, where CAS is instructed to automatically redirect to Azure AD on the server side, thereby making itself completely invisible to the enduser. This option can be achieved by the following setting:

```
cas.authn.pac4j.saml[0].auto-redirect-type=SERVER
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[delegation]: https://apereo.github.io/cas/6.6.x/integration/Delegate-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html