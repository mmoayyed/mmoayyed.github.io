---
layout:     post
title:      Apereo CAS - MFA Enrollment w/ Duo Security
summary:    Handle multifactor user enrollment with Duo Security with your registration application and provide a seamless login experience with Apereo CAS.
tags:       ["CAS 7.0.x", "Delegated Authentication", "MFA"]
---

Apereo CAS can integrate with [Duo Security](https://www.duo.com/) to provide a smooth and seamless multifactor authentication scenario. [Support for Duo Security](https://apereo.github.io/cas/development/mfa/DuoSecurity-Authentication.html) can cover authentication scenarios for web-based applications as well as command-line interfaces and APIs. In this walkthrough, we'll take a look at a few options that address user enrollment and onboarding, particularly when outsourced to external applications.

{% include googlead1.html  %}

This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `17`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Overview

If you would rather not rely on Duo Security’s built-in registration flow and have your registration application that allows users to onboard and enroll with Duo Security, you can instruct CAS to redirect to your enrollment application, if the user’s account status is determined to require enrollment. In this scenario, CAS will employ Duo Security's APIs to check for the authenticated user's account status. If the user account requires enrollment, CAS may direct the authentication flow to an external application that may handle user enrollment and onboarding.

This typically means that you must turn on user-account-status checking in CAS so that it can verify the user’s account status directly with Duo Security:

```
cas.authn.mfa.duo[0].account-status-enabled=true
```
{% include googlead1.html  %}
...and of course, you need to teach CAS about your MFA enrollment application:

```
cas.authn.mfa.duo[0].registration.registration-url=https://mymfa.example.org
```

Additionally, this means that:

- You must make sure your integration type, as selected in Duo Security’s admin dashboard, is chosen to be the correct type, *Web SDK*, that would allow CAS to execute such requests.
- The user in question must not have been onboard, enrolled, or created previously anywhere in Duo Security.

With this setup and once you go through the flow, particularly with a user account that requires enrollment, you should see the following statements in your CAS server logs:
{% include googlead1.html  %}
```
- <Contacting Duo to inquire about username [casuser]>
- <Received Duo response [{"response": {"enroll_portal_url": "...", "result": "enroll", 
    "status_msg": "Enroll an authentication device to proceed"}, "stat": "OK"}]>
...

- <Duo Security registration url for enrollment is ...>
```

The redirect URL to your enrollment application may include a special `principal` query parameter that contains the user’s identity as JWT. To allow CAS to build this particular token, you will need to account for the following settings:
{% include googlead1.html  %}
```
cas.authn.mfa.duo[0].registration.crypto.enabled=true
cas.authn.mfa.duo[0].registration.crypto.signing.key=...
cas.authn.mfa.duo[0].registration.crypto.encryption.key=...
```

A few things to note:

- If you are OK with a non-encrypted token, you can always turn off encryption via `cas.authn.mfa.duo[0].registration.crypto.encryption-enabled=false`.
- If you don't have the keys immediately available, CAS would generate those for you and output those in the logs after your first attempt. Copy/paste from the logs as necessary.

The decoded JWT payload, once unpacked and verified by the client application, would match the following:
{% include googlead1.html  %}
```json
{
  "aud": "mymfa.example.org",
  "sub": "casuser",
  "iss": "https://localhost:8443/cas",
  "iat": 1666104721,
  "jti": "a5269022-29c5-400d-9550-90f796409a67"
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html