---
layout:     post
title:      Apereo CAS - Multifactor Provider Selection
summary:    Learn how to configure CAS to integrate with and use multiple multifactor providers at the same time. This post also reveals a few super secret and yet open-source strategies one may use to select appropriate providers for authentication attempts, whether automatically or based on a menu.
tags:       ["CAS 7.0.x", "MFA"]
---

# Overview

Sometimes, it takes more than one multifactor provider to change a lightbulb. With CAS, it is certainly possible to configure more than one provider integration at the same time. The trick, however, is to decide the appropriate provider, should more than one qualify for the same transaction. Imagine you have an application registered with CAS whose multifactor authentication policy is equally deserving of, let's say, Duo Security as well as Google Authenticator. How would you go about choosing one that makes the most sense? 

{% include googlead1.html %}

Our starting position is based on:

- CAS `7.0.x`
- Java `21`

# Configuration

So, let's pretend that our application is registered with CAS as such:
{% include googlead1.html %}
```json
{
  "@class": "org.apereo.cas.services.CasRegisteredService",
  "serviceId": "^https://app.example.org/login.*",
  "name": "Example",
  "id": 1,
  "multifactorPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "multifactorAuthenticationProviders" : [ "java.util.LinkedHashSet", [ "mfa-duo", "mfa-gauth" ] ]
  }
}
```

Our application policy in summary says: *Authentication requests that are matched against this policy must additionally go through multifactor authentication flows that may be carried out by either Duo Security or Google Authenticator.*

So, how do we choose?

## Multifactor Selection Menu

One option is to put the power back into users' hands and let them decide. CAS may be configured to present a menu of qualifying multifactor provider integrations for the authentication attempt, asking the user to choose one that makes the most sense. To enable the selection menu, one would do this:
{% include googlead1.html %}
```properties
cas.authn.mfa.core.provider-selection.provider-selection-enabled=true
```
...which may result into this:

{% include image.html img="https://user-images.githubusercontent.com/1205228/57374168-1a5a6e80-714f-11e9-838a-7b5d37837826.png"
width="60%" title="Multifactor Selection Menu" %}

## Multifactor Provider Choice

Once the user has chosen a multifactor authentication flow, this choice is remembered by CAS in form of a special cookie, usually named `CASMFASELECTION`, that would then remove the need for the user to keep making that selection again and again. This is the default behavior, and can of course be turned off via:
{% include googlead1.html %}
```properties
cas.authn.mfa.core.provider-selection.cookie.enabled=false
```

By default, this cookie will stay around until the browser is shutdown which allows the user to reset their last known multifactor option and see the selection menu again. If you wish to keep the cookie around beyond a browser shutdown event, you may do so via:
{% include googlead1.html %}
```properties
cas.authn.mfa.core.provider-selection.cookie.max-age=P30D
```

Ultimately if you wish to take full control of the multifactor selection menu setting, you can override the given behavior via your own implementation:

```java
@Bean
public Action multifactorProviderSelectedAction() {
    return new MyMultifactorProviderSelectedAction();
}
```

You may also, in a similar manner, override the cookie generation process:
{% include googlead1.html %}
```java
@Bean
public CasCookieBuilder multifactorAuthenticationProviderSelectionCookieGenerator() {
    return new MyCasCookieBuilder();
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.


# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
