---
layout:     post
title:      Apereo CAS - Duo Security MFA Universal Prompt
summary:    Learn how to use Duo Security's new Universal Prompt option for multifactor authentication with Apereo CAS and enjoy an iFrame-less world.
tags:       [CAS]
---

Duo Security's [Universal Prompt](https://duo.com/blog/easier-more-effective-mfa-for-all-the-duo-universal-prompt-project) is a major technical and UX redesign of core Duo Security's multifactor functionality. It provides a redesign of the web-based authentication prompt and upgrades the Duo Web SDK to provide a new mechanism for delivering the prompt to both Duo-developed and partner-built software integrations *without the iFrame*. 

{% include googlead1.html  %}

Apereo CAS can integrate with [Duo Security](https://www.duo.com/) to provide a smooth and seamless multifactor authentication scenario. [Support for Duo Security](https://apereo.github.io/cas/6.3.x/mfa/DuoSecurity-Authentication.html) can cover authentication scenarios for web-based applications as well as command-line interfaces and APIs. In this walkthrough, we'll take a look at the Duo Security's *Universal Prompt* using Duo's [OIDC Auth API](https://duo.com/docs/oauthapi) and the integration strategy with Apereo CAS.

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- CAS `6.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Configuration

The *Universal Prompt* variant does not require you to generate and use an application key value. Instead, it requires a client id and client secret, which are known and taught to CAS using the integration key and secret key configuration settings. You will need to get your integration key, secret key, and API hostname from Duo Security when you register CAS as a protected application.

In the Duo Security's admin console, start with the *Protect an Application* option and choose *Web SDK*:

{% include googlead1.html  %}

{% include image.html img="https://user-images.githubusercontent.com/1205228/117565228-608f9300-b0c5-11eb-8847-2f2a924845f3.png" 
width="80%" title="Duo Security Universal Prompt w/ CAS" %}

Be sure to note down the integration settings and finally save the entry.

{% include image.html img="https://user-images.githubusercontent.com/1205228/117565257-8321ac00-b0c5-11eb-8932-0924616dcab1.png" 
width="80%" title="Duo Security Universal Prompt w/ CAS" %}

{% include googlead1.html  %}

In your CAS settings, typically found in the `cas.properties` file, the absence of `duo-application-key` indicates that Universal Prompt should be the primary integration mode.

```
cas.authn.mfa.duo[0].duo-secret-key=...
cas.authn.mfa.duo[0].duo-integration-key=...
cas.authn.mfa.duo[0].duo-api-host=..
```

Furthermore, let's make sure that all requests from all applications should be asked for multifactor authentication with Duo Security:

{% include googlead2.html  %}

```properties
cas.authn.mfa.global-provider-id=mfa-duo
```

That's it.

## What's the difference?

- The current Duo Prompt is delivered via an inline frame (or "iFrame") that is embedded in a thymeleaf template file hosted by CAS. This is no longer the case with Universal Prompt where CAS will instead redirect to a page hosted by Duo at `duosecurity.com` to show the Duo Prompt, and Duo Security will finally redirect back to CAS after the user completes two-factor authentication.

{% include googlead1.html  %}

- To achieve the frameless migration, the Duo Web SDK is updated to bring the Universal Prompt experience to applications. The new SDK is built on top of the OIDC standards-based API today to begin the process of updating developed Duo integrations to support the Universal Prompt.

- In the Duo Security's admin console, you may note that field labels no longer refer to *Integration Key* or *Secret Key*. With Universal Prompt, these fields are renamed to better align with the OAuth 2.0 specification and are now known as *Client ID* or `client_id` and the *Client secret* or `client_secret`.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
