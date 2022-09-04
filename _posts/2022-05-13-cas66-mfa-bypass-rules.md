---
layout:     post
title:      Apereo CAS - Bypass Multifactor Authentication
summary:    Learn how to skip and bypass multifactor authentication flows using authentication and/or subject data and a variety of other conditions.
tags:       ["CAS 6.6.x", "MFA"]
---

Apereo CAS supports a wide array of [multifactor authentication providers](https://apereo.github.io/cas/6.6.x/mfa/Configuring-Multifactor-Authentication.html). Each multifactor provider is equipped with options to allow for conditional bypassing of multifactor authentication, where such rules are typically based on data gathered during the initial primary authentication event. Once the provider is chosen to honor the authentication request, bypass rules are then consulted to calculate whether the provider should ignore the request and skip MFA conditionally. 
{% include googlead1.html %}
In this blog post, we will examine *some* of the options available to handle bypass scenarios of multifactor providers. While all listed options should apply to all supported multifactor authentication providers supported by Apereo CAS, in this post we will specifically focus on the integration with [Duo Security][duosecurity].

Our starting position is based on the following:

- CAS `6.6.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Overview

Apereo CAS provides a *default bypass policy* implementation for each multifactor provider that can be configured through CAS properties. Each multifactor provider implementation, such as one available for Duo Security would consult this policy for bypass events and conditions.
{% include googlead1.html %}
Bypass rules typically operate and evaluate conditions based on data that is assembled during the primary authentication event. This data may be related to metadata collection about the authentication transaction itself, such as the credential type, authentication date/time, etc. It is also possible, and perhaps more common, to design bypass rules based on data collected about the authenticated subject in form of a principal attribute.

Assuming you have a multifactor authentication flow based on [Duo Security][duosecurity], let's break this down.

## Bypass via Authentication

Assuming the authentication transaction ultimately collects an authentication attribute called `bypass`, you may instruct the provider to skip the multifactor flow if this attribute is found and its value(s) matches against a specific regular-expression pattern:
{% include googlead1.html %}
```
cas.authn.mfa.duo[0].bypass.authentication-attribute-name=bypass
cas.authn.mfa.duo[0].bypass.authentication-attribute-value=.*bypass-enabled.*
```

The collection and construction of the `bypass` authentication attribute are up to you; typically such attributes are assembled as part of a custom authentication scheme via dedicated authentication handlers. 

If you wanted, you could certainly take this one step further and skip multifactor if a certain authentication handler is involved to handle the primary authentication attempt:

```
cas.authn.mfa.duo[0].bypass.authentication-handler-name=MyLdapAuthenticationHandler
```
{% include googlead1.html %}
...or a certain type of credential type is used:

```
cas.authn.mfa.duo[0].bypass.credential-class-type=org.apereo.cas.custom.MyCredential
```

## Bypass via Principal

Suppose that the LDAP authentication facility in Apereo CAS can collect a multivalued attribute as `group` with values such as `student`, `advanced`, `remote` once the user is successfully authenticated. Just as before, you may instruct the provider to skip the multifactor flow if this *principal* attribute is found and its value(s) matches against a specific regular-expression pattern:
{% include googlead1.html %}
```
cas.authn.mfa.duo[0].bypass.principal-attribute-name=group
cas.authn.mfa.duo[0].bypass.principal-attribute-value=.*advanced.*
```

## Bypass for Application

Application policies defined in Apereo CAS as registered services may of course be assigned a special block to skip multifactor authentication flows:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "^https://app.example.org/.+",
  "id" : 100,
  "multifactorPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "bypassEnabled" : "true"
  }
}
```
{% include googlead1.html %}
This will bypass multifactor authentication for all forms of the application whose URL matches the specified pattern, regardless of the authentication transaction or the traits of the authenticated subject. Of course, we could narrow this policy down to a specific set of users that carry a special attribute:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "^https://app.example.org/.+",
  "id" : 100,
  "multifactorPolicy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "bypassPrincipalAttributeName": "group",
    "bypassPrincipalAttributeValue": "advanced.*",
  }
}
```

## Scripted Bypass

When all other rules fail, you may of course design and script your bypass policy:
{% include googlead1.html %}
```groovy
def run(final Object... args) {
    def authentication = args[0]
    def principal = args[1]
    def registeredService = args[2]
    def provider = args[3]
    def logger = args[4]
    def httpRequest = args[5]
    logger.info("Bypassing multifactor for provider ${provider.id}")
    return false
}
```

The outcome of the script, if `true`, indicates that multifactor authentication for the requested provider should proceed. Otherwise `false` indicates that multifactor authentication for this provider should be skipped and bypassed. Remember to specify the location of the Groovy script for the appropriate provider as well:
{% include googlead1.html %}
```
cas.authn.mfa.duo[0].bypass.groovy.location=file:/path/to/MyBypassRules.groovy
```

## Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[duosecurity]: https://apereo.github.io/cas/6.6.x/mfa/DuoSecurity-Authentication.html
