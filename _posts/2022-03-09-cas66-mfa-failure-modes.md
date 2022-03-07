---
layout:     post
title:      Apereo CAS - Multifactor Authentication Failure Modes
summary:    Learn how to manage failure scenarios when multifactor authentication providers become unavailable or unresponsive.
tags:       ["CAS 6.6.x", "MFA"]
---

Apereo CAS supports a wide array of multifactor authentication providers. Each provider can run queries for status and health checks to determine its availability so that CAS can, on a positive result, route the authentication flow to the provider. Of course, there are times when the multifactor provider may become unavailable and unresponsive due to connection failures, network issues, or various other scenarios. In this blog post, we will examine the range of options available to handle failure scenarios of multifactor providers and the conditions under which one may allow existing integration to pass through CAS when failures occur.

{% include googlead1.html  %}

Our starting position is based on the following:

- CAS `6.6.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Failure Modes

Failure modes for multifactor authentication generally outline system response and behavior when a provider failure is detected. For example, when a provider is evaluated to be failing, a failure mode could indicate that authentication flow should be blocked and stopped, or perhaps the end-user should be allowed to bypass multifactor authentication and proceed.
{% include googlead1.html  %}
In scenarios where multifactor authentication is bypassed, we should also determine the payload the receiving application would receive. Should CAS communicate to the application that multifactor authentication is bypassed no authentication context is available? Or in severe emergency scenarios, should CAS instruct the application that multifactor authentication did occur, allowing the user to pass through, albeit temporarily until the provider has restored its status? 

Fortunately, CAS does not have to make these decisions but provides options for all such scenarios. So, let's review.

## Failure Mode Per Application

A registered application in CAS can specify a multifactor authentication policy along with its failure mode:

```json
{
  "@class": "org.apereo.cas.services.RegexRegisteredService",
  "serviceId": "^https://something.org/anything/open",
  "name": "Open",
  "id": 2,
  "description": "Open Service",
  "multifactorPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "multifactorAuthenticationProviders" : [ "java.util.LinkedHashSet", [ "mfa-yubikey" ] ],
    "failureMode" : "OPEN"
  }
}
```
{% include googlead1.html  %}
The policy requires that the application be put through a multifactor authentication flow using YubiKey. If the YubiKey provider is unavailable and failing, CAS would skip the multifactor authentication flow altogether, and will **NOT** communicate an authentication context to the application. In a sense, the payload that is shared with the application would be, in summary, something like this:

```json
"attributes" : {
    "credentialType" : [ "UsernamePasswordCredential" ],
    "bypassedMultifactorAuthenticationProviderId" : [ "mfa-yubikey" ],
    "bypassMultifactorAuthentication" : [ true ]
}
```

Desperate times may require desperate measures. We could also switch to a `PHANTOM` failure mode:
{% include googlead1.html  %}
```json
{
  "@class": "org.apereo.cas.services.RegexRegisteredService",
  "serviceId": "^https://something.org/anything/open",
  "name": "Open",
  "id": 2,
  "description": "Open Service",
  "multifactorPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "multifactorAuthenticationProviders" : [ "java.util.LinkedHashSet", [ "mfa-yubikey" ] ],
    "failureMode" : "PHANTOM"
  }
}
```

This is very similar to the `OPEN` failure mode; the policy requires that the application be put through a multifactor authentication flow using YubiKey, and if the YubiKey provider is unavailable and failing, CAS would skip the multifactor authentication flow altogether, but this time it will communicate an authentication context to the application. In a sense, the payload that is shared with the application would be, in summary, something like this:

```json
"attributes" : {
    "credentialType" : [ "UsernamePasswordCredential" ],
    "authenticationContext" : [ "mfa-yubikey" ],
    "bypassedMultifactorAuthenticationProviderId" : [ "mfa-yubikey" ],
    "bypassMultifactorAuthentication" : [ true ]
}
```

## Failure Mode Overrides

If you prefer to not specify a failure mode for every single application, worry not. You can go one step higher and define a multifactor authentication failure mode for the provider itself:

```properties
cas.authn.mfa.yubikey.failure-mode=OPEN
```
{% include googlead1.html  %}
...and if you have multiple providers, you could go one step higher and define a multifactor authentication failure mode for the entire CAS deployment:

```properties
cas.authn.mfa.yubikey.failure-mode=UNDEFINED
cas.authn.mfa.core.global-failure-mode=PHANTOM
```

## Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
