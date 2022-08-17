---
layout:     post
title:      Apereo CAS - OpenID Connect Scopes & Claims
summary:    Configure Apereo CAS to act as an OpenID Connect identity provider, allowing the release of custom scopes and claims to applications.
tags:       ["CAS 6.6.x", "OpenID Connect"]
---

Apereo CAS can be configured to act as an [OpenID Connect identity provider][oidc]. In doing so, OpenID Connect client applications can be registered with CAS to authorize the release standard as well as custom scopes. Additionally, CAS can be allowed to release claims back to registered applications in a *scope-free* setting. This blog post aims to review options that exist in Apereo CAS when it comes to managing and releasing OpenID Connect scopes and claims.

{% include googlead1.html  %}

This post specifically requires and focuses on:

- CAS `6.6.x`
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

cas.authn.attribute-repository.stub.attributes.identity-name=apereo-cas
cas.authn.attribute-repository.stub.attributes.common-name=CAS
```
{% include googlead1.html  %}
## Custom Scopes

We could of course define our own custom scope that contains a tailored set of claims:

```properties
cas.authn.oidc.core.user-defined-scopes.MyCustomScope=cn,given:name,name,family_name
```

We should also make sure our scope is supported and advertised via OpenID Connect discovery:
{% include googlead1.html  %}
```properties
# Add/remove scopes as necessary here...
cas.authn.oidc.discovery.scopes=openid,...,MyCustomScope
```

...and likewise, any claim that we include in our `MyCustomScope` scope must also be supported and advertised:

```properties
cas.authn.oidc.discovery.claims=sub,name,cn,given-name,given:name,family_name
```
{% include googlead1.html  %}
Now that our `MyCustomScope` scope is ready, we could assign it to the relying party so that CAS can begin to handle the claim release based on previous rules:

```json
{
  "@class" : "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "abcdefg",
  "clientSecret": "s3cr3T",
  "serviceId" : "https://example.org/redirect-uri",
  "name": "Example",
  "id": 1,
  "scopes" : [ "java.util.HashSet", [ "openid", "profile", "MyCustomScope" ] ]
}
```

## Mapping Claims

You might have noticed that our attribute repository does not retrieve all the claims and attributes that we would want to be release. For example, consider the following use case:

- CAS should release the claim `cn` which is packed into our scope `MyCustomScope`. Since we do not have a `cn` attribute available in our attribute repository, CAS should use the value of the `common-name` attribute when it begins to process `cn`. This is taught to CAS using the following mapping rule:
{% include googlead1.html  %}
```properties
cas.authn.oidc.core.claims-map.cn=common-name
```

- Likewise, CAS should release the claim `family_name` which is a standard claim and part of the `profile` scope. However, we do not want to use the value of the `family_name` attribute that comes from the attribute repository. Rather, CAS should use the value of the `identity-name` attribute when it begins to process `family_name`. This is taught to CAS using the following mapping rule:
{% include googlead1.html  %}
```properties
cas.authn.oidc.core.claims-map.family_name=identity-name
```

<div class="alert alert-info">
  <strong>Note</strong><br/>Note that claim mapping rules should equally apply to claims that are packed into the ID token as well as those that are produced by the <i>user profile</i> endpoint. 
</div>

Finally, please note that mapping rules defined via this technique are global and cannot be revised and modified on a per relying party basis. For example, the value for claim `family_name` will always be based on `identity-name` for all requests and all client applications that are authorized to receive it. Changing this mapping rule on a per application basis will require further modifications that are outside the scope of this post.

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
{% include googlead1.html  %}
In this scenario, our application is only authorized to use the `client_credentials` grant and is assigned an attribute release policy that can generate *and* release claims as attributes, removing the need for the presence of an external attribute repository source.

<div class="alert alert-info">
  <strong>Note</strong><br/>It's important to specify <code>openid</code> as an allowed scope. Furthermore, note that inline groovy evaluation does come with a performance cost. Trust and verify, etc.
</div>

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[initializr]: https://casinit.herokuapp.com
[jsonsvc]: https://apereo.github.io/cas/development/services/JSON-Service-Management.html
[oidc]: https://apereo.github.io/cas/development/authentication/OIDC-Authentication.html