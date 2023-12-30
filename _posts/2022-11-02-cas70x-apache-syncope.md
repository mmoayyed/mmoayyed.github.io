---
layout:     post
title:      Apereo CAS - Integrations with Apache Syncope
summary:   Learn about available strategies that allow one to set up an integration between Apache Syncope and Apereo CAS.
tags:       ["CAS 7.0.x", "Service Integrations"]
---

[Apache Syncope](https://syncope.apache.org/) is a powerful, open-source Java-based enterprise-ready solution that at its core provides services for identity management, synchronization, and provisioning of accounts across repositories. Apereo CAS offers several integration strategies with Apache Syncope that specifically relate to authentication, attribute resolution and account management, etc. Such options empower both solutions to take advantage of each other's core competencies and, when combined, provide a powerful, feature-rich, and extensible open-source IAM solution for enterprise deployments.

{% include googlead1.html %}

<div class="alert alert-info">
  <strong>Note</strong><br/><a href="https://syncope.apache.org/docs/3.0/reference-guide.html">Apache Syncope 3.0.0 Maggiore</a>, about to be released as of this writing, offers a built-in Web Access or WA module that acts as a central hub for authentication, authorization and single sign-on based on Apereo CAS. More on this later!
</div>

In this post, we will briefly take a look at a few options that allow for a seamless integration between Apereo CAS and Apache Syncope. This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Authentication

Apache Syncope can act as the central repository and identity store of CAS-enabled accounts. Once CAS receives credentials from the end user, it can take advantage of Syncope's REST APIs to submit user credentials to Syncope for validation. The resulting payload upon success may also pass back a representation of the authenticated user account that would then be employed and consumed by CAS to build a single sign-on session.

Assuming you have prepared your CAS to build to include the appropriate [Apache Syncope integration module](https://apereo.github.io/cas/7.0.x/authentication/Syncope-Authentication.html), the following settings at a minimum should handle this integration:

```properties
cas.authn.syncope.url=...
cas.authn.syncope.domain=Master
```

# Attributes

The source you wish to use for authentication may not necessarily be the same place where user attributes can be found. This separation of concerns allows for use cases where user credentials may be found and validated in one account store, i.e. LDAP, and attributes and various other entitlements could ve fetched from a separate source such as Apache Syncope. In doing so, the following settings at a minimum should handle this type of setup:

```properties
cas.authn.attribute-repository.syncope.url=...
cas.authn.attribute-repository.syncope.basic-auth-username=...
cas.authn.attribute-repository.syncope.basic-auth-password=...
cas.authn.attribute-repository.syncope.search-filter=username=={user}
```

# Authorization

Whether as part of a direct authentication attempt or a separate attribute resolution request, the accepted user profile from Apache Syncope may contain assigned user roles that are translated by CAS into a `syncopeUserRoles` attribute. We could then take advantage of the Attribute-based Access Control functionality in CAS and set up authorization rules for applications based on user roles:

```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "^https://app.example.org",
  "name" : "Application",
  "id" : 1,
  "accessStrategy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
    "requiredAttributes" : {
      "@class" : "java.util.HashMap",
      "syncopeUserRoles" : [ "java.util.HashSet", [ "admin" ] ]
    }
  }
}
```

This means, to access this application the authenticated user must have a `syncopeUserRoles` attribute with the value of `admin` among the available attribute values and roles found from Apache Syncope.

# Provisioning of External Accounts

When you are handing off the authentication task to an external identity provider, CAS may be then configured to extract user profiles from the identity provider's response and provision those into target systems via Apache Syncope, allowing you optionally to link external/guest accounts with their equivalent found in the authentication source used by CAS, etc.

```properties
cas.authn.syncope.provisioning.enabled=true
cas.authn.syncope.provisioning.url=...
cas.authn.syncope.provisioning.realm=...
cas.authn.syncope.provisioning.basic-auth-username=...
cas.authn.syncope.provisioning.basic-auth-password=...
```

# Self-service Account Sign-up

CAS provides a modest workflow to handle self-service account registration which allows users to sign up for accounts with CAS, provide details, activate their account, and begin using CAS. Such account registration requests may be sent to Apache Syncope for provisioning and follow-up processes.

```properties
cas.account-registration.provisioning.syncope.url=...
cas.account-registration.provisioning.syncope.basic-auth-username=...
cas.account-registration.provisioning.syncope.basic-auth-password=...
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[profileselection]: https://apereo.github.io/cas/7.0.x/integration/Delegate-Authentication-ProfileSelection.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html