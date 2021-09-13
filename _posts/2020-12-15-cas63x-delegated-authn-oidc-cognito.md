---
layout:     post
title:      Apereo CAS - Delegated Authentication with Amazon Cognito
summary:    Learn how to use Amazon Cognito as an external OpenID Connect identity provider and connect it to CAS for a delegated authentication scenario.
tags:       [CAS]
---

Apereo CAS has had support to delegate authentication to [external OpenID Connect identity providers](https://apereo.github.io/cas/6.3.x/integration/Delegate-Authentication.html) for quite some time. This functionality, if memory serves me correctly, started around CAS 3.x as an extension based on the [pac4j project](https://github.com/pac4j/pac4j) which then later found its way into the CAS codebase as a first-class feature. Since then, the functionality more or less has evolved to allow the adopter less configuration overhead and fancier ways to automated workflows.

Of course, *delegation* is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate identity provider endpoint, and on the return trip back, CAS is tasked to shake hands, parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. In other words, in delegated scenarios, the main identity provider is an external system and CAS simply begins to act as a client or proxy in between.

{% include googlead1.html  %}

In this blog post, we will start from a modest OpenID Connect client application that is integrated with CAS and will be using [Amazon Cognito](https://aws.amazon.com/cognito/) as our external OpenID Connect identity provider to accommodate the following authentication flow:

{% include image.html img="https://user-images.githubusercontent.com/1205228/102455968-bcde1180-4055-11eb-83d0-267d0046f9f6.png" width="90%" title="CAS Login Flow" %}

- User accesses OpenID Connect client application.
- User is redirected to CAS, acting as an OpenID Connect identity provider.
- CAS, acting as a client itself, lets the user delegate the flow to Amazon Cognito.
- User logs in using Amazon Cognito credentials and is redirected back to CAS.
- CAS establishes an SSO session and redirects the user back to the OpenID Connect client application.
- OpenID Connect client application shakes hands with CAS and allows the user to login.

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Configuration

Once you have the correct modules in the WAR overlay for [OpenID Connect](https://apereo.github.io/cas/6.3.x/installation/OIDC-Authentication.html) and [Delegated Authentication](https://apereo.github.io/cas/6.3.x/integration/Delegate-Authentication.html), you will need to make sure CAS is able to hand off authentication to the Amazon Cognito identity provider:

```
cas.authn.pac4j.oidc[0].generic.id=abcdefgh
cas.authn.pac4j.oidc[0].generic.secret=1234567890
cas.authn.pac4j.oidc[0].generic.discovery-uri=\
  https://cognito.amazonaws.com/xyz/.well-known/openid-configuration
cas.authn.pac4j.oidc[0].generic.client-name=AwsCognitoOidcClient
```

Of course, we also need to make sure our OpenID Connect client application is [registered with CAS](https://apereo.github.io/cas/6.3.x/services/JSON-Service-Management.html):

{% include googlead1.html  %}

```json
{
  "@class": "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "client-id",
  "clientSecret": "secret",
  "serviceId": "https://my-redirect-uri",
  "name": "OIDC",
  "id": 1,
  "supportedGrantTypes": [ "java.util.HashSet", [ "authorization_code" ] ],
  "supportedResponseTypes": [ "java.util.HashSet", [ "code" ] ],
  "attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ChainingAttributeReleasePolicy",
    "policies": [
      "java.util.ArrayList",
      [
        {
          "@class": "org.apereo.cas.oidc.claims.OidcProfileScopeAttributeReleasePolicy",
          "order": 0
        },
        {
          "@class": "org.apereo.cas.services.ReturnMappedAttributeReleasePolicy",
          "order": 1,
          "allowedAttributes" : {
            "@class" : "java.util.TreeMap",
            "custom:roles" : "roles"
          }
        },
        {
          "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
          "allowedAttributes" : [ "java.util.ArrayList", [ "roles", "locale", "email" ] ],
          "order": 2
        }
      ]
    ]
  }
}
```

## Attribute Release Policy

Notice that our service definition intentionally does not define any authorized scopes. Typically, defined scopes for a given service definition control and build attribute release policies internally in CAS and the mere definition of authorized scopes for a client application is sufficient in many cases to let CAS formulate the correct attribute/claim release policies. Such attribute release policies allow one to release standard claims, remap attributes to standard claims, or define custom claims and scopes altogether.

{% include googlead1.html  %}

In our case above, we are taking advantage of an advanced variation of this configuration to define and use free-form attribute release policies outside the confines of a scope to freely build and release claims/attributes. We are chaining multiple release policies together, allowing CAS to iterate through the chain and collect, cascade, and merge results at every step, in the following sequence:

1. Collect and release available claims that map to the OpenID Connect `profile` scope.
2. Take the `custom:roles`, released by Amazon Cognito, and remap/rename it to `roles` instead.
3. Release `roles`, `locale`, and `email` as ID-token claims to the OpenID Connect application.


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html