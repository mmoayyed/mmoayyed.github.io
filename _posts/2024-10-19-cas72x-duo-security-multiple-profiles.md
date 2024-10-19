---
layout:     post
title:      Apereo CAS - Working with Multiple MFA Profiles
summary:    Learn how to register multiple multifactor authentication profiles in CAS using Duo Security, and dynamically seelct the appropriate provider based on user claims or application policies.
tags:       ["CAS 7.2.x", "MFA"]
---

Apereo CAS can integrate with [Duo Security](https://www.duo.com/) to provide a smooth and seamless multifactor authentication scenario. [Support for Duo Security](https://apereo.github.io/cas/development/mfa/DuoSecurity-Authentication.html) can cover authentication scenarios for web-based applications as well as command-line interfaces and APIs. In this walkthrough, we'll take a look at Duo Security's *Universal Prompt* using Duo's [OIDC Auth API](https://duo.com/docs/oauthapi) and the integration strategy with Apereo CAS. Furthermore, we will examine how multiple Duo Security integrations can be defined in CAS, and how one may be able to choose between them, taking into account user attributes and/or application policies.

{% include googlead1.html  %}

This tutorial loosely requires and focuses on:

- CAS `7.2.x`
- Java `21`

## Configuration

The *Universal Prompt* variant does not require you to generate and use an application key value. Instead, it requires a client id and client secret, which are known and taught to CAS using the integration key and secret key configuration settings. You will need to get your integration key, secret key, and API hostname from Duo Security when you register CAS as a protected application.
{% include googlead1.html  %}
```
cas.authn.mfa.duo[0].duo-secret-key=...
cas.authn.mfa.duo[0].duo-integration-key=...
cas.authn.mfa.duo[0].duo-api-host=...
cas.authn.mfa.duo[0].id=mfa-duo
```

It's possible you might need more. The typical use case or need for this is that each unique Duo Security integration would be configured to enable/disable certain settings that deal with allowed authentication factors like telephony, and this allows CAS with a few small conditions to determine which integration should be enabled or activated for the user or the application registered with CAS. The scenario would then be to teach CAS: if user has claim X and/or application is Y, use Duo integration A that allows telephony, or no use integration B that disables it.

To add a second integration, the process is almost identical with the exception of an incrementing configuration index:
{% include googlead1.html  %}
```
cas.authn.mfa.duo[1].duo-secret-key=...
cas.authn.mfa.duo[1].duo-integration-key=...
cas.authn.mfa.duo[1].duo-api-host=...
cas.authn.mfa.duo[1].id=mfa-duo-fancy
```

# Activation

Let's start with the following example use case: you might have an application that needs to go through a very specific MFA policy. Regardless of what the user does or which attribute their profile carries, entry access to the application should force CAS to use a particular MFA integration. This can be done directly inside the application policy:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "^https://app.example.com",
  "id" : 1,
  "name": "App",
  "multifactorPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "multifactorAuthenticationProviders" : [ "java.util.LinkedHashSet", [ "mfa-duo-fancy" ] ]
  }
}
```

Simple enough, but what about all other applications and users? 

For everything else, let's say all users that carry a specific attribute, `email`, with a value that matches the right pattern should go through the other profile. To handle this bit of logic, we need to build a small little script to implement our conditional logic:
{% include googlead1.html  %}
```properties
cas.authn.mfa.groovy-script.location=/path/to/GroovyMfa.groovy
```

The script itself looks like the one below:
{% include googlead1.html  %}
```groovy
def run(final Object... args) {
    def (service,registeredService,authentication,httpRequest,logger) = args

    logger.info("Evaluating principal attributes [{}]", authentication.principal.attributes)
    def email = authentication.principal.attributes['email'][0]
    logger.info("Found email attribute with value [{}]", email)
    if (email.matches(".+@fawnoos.com")) {
        logger.info("Will trigger default Duo Security provider")
        return "mfa-duo"
    }
    logger.warn("Will not trigger MFA at all!")
    return null
}
```

As you probably can tell, the script is examining the `email` attribute value to see if it matches a specific pattern. If so, it will return the appropriate MFA provider id. Otherwise it will instruct the system to skip MFA since user is not eligible. 


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
