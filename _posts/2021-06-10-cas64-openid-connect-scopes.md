---
layout:     post
title:      Apereo CAS - OpenID Connect Scopes & Claims
summary:    Configure Apereo CAS to act as an OpenID Connect identity provider, allowing the release of custom scopes and claims to applications.
tags:       ["CAS 6.4.x", "OpenID Connect"]
---

Apereo CAS can be configured to act as an [OpenID Connect identity provider][oidc]. In doing so, OpenID Connect client applications can be registered with CAS to authorize the release standard as well as custom scopes. Additionally, CAS can be allowed to release claims back to registered applications in a *scope-free* setting. This blog post aims to review options that exist in Apereo CAS when it comes to managing and releasing OpenID Connect scopes and claims.

{% include googlead1.html  %}

This post specifically requires and focuses on:

- CAS `6.4.x`
- Java `11`
- [JSON Service Registry][jsonsvc]
- [Apereo CAS Initializr][initializr] 

## Standard Scopes

The most basic form of an application registration with CAS allows the release of standard scopes such as `profile`:

```json
{
  "@class" : "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "abcdefg",
  "clientSecret": "s3cr3T",
  "serviceId" : "https://example.org/redirect-uri",
  "name": "Example",
  "id": 1,
  "scopes" : [ "java.util.HashSet", [ "openid", "profile" ] ]
}
```

{% include googlead2.html  %}

In this scenario, individual claims that are part of the standard `profile` scope are released to the application. Such claims need to be resolved and fetched by CAS as attributes from attribute sources. For example, we could have a *stub* attribute repository that generates hardcoded, static attribute names and values that map onto the claims supported and covered by the `profile` scope:

```properties
cas.authn.attribute-repository.stub.attributes.name=Misagh Moayyed
cas.authn.attribute-repository.stub.attributes.family_name=Moayyed
```

## Scope-free Claims

CAS also allows the specification and release of individual claims without a scope. In this form, a dedicated attribute release policy must be designed to authorize the release of attributes as claims:

{% include googlead1.html  %}

```json
{
  "@class" : "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "client",
  "clientSecret": "secret",
  "serviceId" : "^https://localhost:8082/cas/.*",
  "name": "Sample",
  "id": 1,
  "supportedGrantTypes": [ "java.util.HashSet", [ "client_credentials" ] ],
  "scopes" : [ "java.util.HashSet", ["openid"]],
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnMappedAttributeReleasePolicy",
    "allowedAttributes" : {
      "@class" : "java.util.TreeMap",
      "name" : "groovy { return ['Misagh Moayyed'] }",
      "family_name" : "groovy { return ['Moayyed'] }",
      "url" : "groovy { return ['https://fawnoos.com'] }"
    }
  }
}
```

In this scenario, our application is only authorized to use the `client_credentials` grant and is assigned an attribute release policy that can generate *and* release claims as attributes, removing the need for the presence of an external attribute repository source.

<div class="alert alert-info">
  <strong>Note</strong><br/>It's important to specify <code>openid</code> as an allowed scope.
</div>

## Custom Scopes

You may also decide to design your scopes as bundles of custom attributes and claims. For example, one could design a `MyCustomScope` scope that contains two claims:

{% include googlead1.html  %}

```properties
cas.authn.oidc.core.user-defined-scopes.MyCustomScope=cn
```

You must also instruct the identity provider to enlist the custom scope in its discovery so other application can learn of the scope and choose to request it when necessary:

```properties
cas.authn.oidc.discovery.scopes=openid,profile,MyCustomScope
cas.authn.oidc.discovery.claims=name,preferred_username,cn
```

You should then authorize the application to receive claims assigned to the scope `MyCustomScope` when requested:

{% include googlead2.html  %}

```json
{
  "@class": "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "client-id",
  "clientSecret": "secret",
  "serviceId": "https://example.org/redirect-uri",
  "name": "Example",
  "id": 1,
  "scopes" : [ "java.util.HashSet", [ "openid", "MyCustomScope" ] ],
  "supportedResponseTypes": [ "java.util.HashSet", [ "code" ] ]
}
```

In this scenario, our application is only authorized to use the `code` response type and is authorized to release the claim `cn` associated with the `MyCustomScope` scope. Just as before, `cn` needs to be resolved and fetched by CAS as attributes from attribute sources:

```properties
cas.authn.attribute-repository.stub.attributes.cn=Misagh Moayyed
```

{% include googlead1.html  %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[initializr]: https://casinit.herokuapp.com
[jsonsvc]: https://apereo.github.io/cas/6.4.x/services/JSON-Service-Management.html
[oidc]: https://apereo.github.io/cas/6.4.x/authentication/OIDC-Authentication.html