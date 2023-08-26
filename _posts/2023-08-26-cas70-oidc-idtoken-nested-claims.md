---
layout:     post
title:      Apereo CAS - OpenID Connect Nested Claims
summary:    Learn how to build nested or structured claims into an OpenID Connect ID token.
tags:       ["CAS 7.0.x", "OpenID Connect", "Attribute Resolution"]
---

An ID token is an artifact that proves that the user has been authenticated. It was introduced by OpenID Connect (OIDC), an open standard for authentication used by many identity providers such as Apereo CAS. An ID token is encoded as a [JSON Web Token (JWT)](https://jwt.io/), (pronounced as *jought* like *bought*, *naught*, etc.), which is a standard format that allows client applications to inspect its contents or *claims* and make sure it comes from the expected issuer, etc. 

{% include googlead1.html  %}

Claims in an ID token (or in any JWT for that matter) can be flat or hierarchical and structured. In this post, we will take a brief look at the setup required in Apereo CAS to support and build hierarchical claims into an OpenID Connect ID token.

Our starting position is:
{% include googlead1.html  %}
- CAS `7.0.x`
- Java `21`

# ID Tokens

A typical ID token may look like the following:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbXktZG9tYWluLmF1dGgwLmN...
```

Of course, this isn't readable as is and you have to [decode it](https://jwt.io/) to see what content the JWT holds. Note that the ID token is signed by the issuer with its private key. This guarantees you the origin of the token and ensures that it has not been tampered with. Once the ID token is decoded, the contents or *claims* inside this JWT typically match the following:
{% include googlead1.html  %}
```json
{ 
  "iss": "http://sso.example.org/cas/oidc", 
  "sub": "casuser", 
  "aud": "1234abcdef", 
  "exp": 1311281970, 
  "iat": 1311280970, 
  "name": "Fawnoos", 
  "given_name": "John", 
  "family_name": "Smith"
}
```

These JSON properties are called **claims**, and they are declarations about the user and the token itself. The claims about the user define the user’s identity. One important claim is the `aud` claim. This claim defines the audience of the token, i.e., the client web application that is meant to be the final recipient of the token. In the case of the ID token, its value is the client ID of the application that should consume the token.

You may observe that all noted claims are *flat*; that is, there is no hierarchy or structure to any of the claims and each claim name is directly linked and mapped to a claim value. Of course, claims may also be a given structure such as the following example:
{% include googlead1.html  %}
```json
{ 
  "iss": "http://sso.example.org/cas/oidc", 
  "sub": "casuser", 
  "aud": "1234abcdef", 
  "exp": 1311281970, 
  "iat": 1311280970, 
  "org": {
    "apereo": {
      "cas": {
        "name": "Apereo CAS"
      }
    }
  }
}
```

# Setup

Let's pretend that an Apereo CAS deployment is configured to pull out and produce an attribute called `organization` with multiple values: `apereo`, `cas`, and `oss`. We intend to collect this attribute and stuff it as a structured claim `org.apereo.cas.entity` into an ID token. To do so, we can decorate the attribute `organization` with an [attribute definition](https://apereo.github.io/cas/development/authentication/OIDC-Attribute-Definitions.html) and tag it as a structured claim:
{% include googlead1.html  %}
```json
"organization": {
  "@class": "org.apereo.cas.oidc.claims.OidcAttributeDefinition",
  "key": "organization",
  "name": "org.apereo.cas.entity",
  "structured": true
}
```


<div class="alert alert-info">
  <strong>Note</strong><br/>Structured attributes <strong>MUST</strong> indicate a hierarchy where each level and step is separated by a dot.
</div>

Once the attribute definition is processed, CAS will automatically rename the attribute virtually to its new name, `org.apereo.cas.entity`. This means that our attribute release policies should also authorize the release of this attribute by its new name:
{% include googlead1.html  %}
```json
"attributeReleasePolicy" : {
  "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
  "allowedAttributes" : [ "java.util.ArrayList", [ "org.apereo.cas.entity" ] ]
}
```

At this point, our OpenID Connect client is authorized to receive the claim `org.apereo.cas.entity` that contains multiple values: `apereo`, `cas`, and `oss`. However, because the attribute definition is marked as *structured* **AND** the attribute definition name indicates a hierarchy with separate levels each noted by a **`.`**, the final ID token that would be produced by CAS should take on the following form:

```json
{ 
  "iss": "http://sso.example.org/cas/oidc", 
  "sub": "casuser", 
  "org": {
    "apereo": {
      "cas": {
        "entity": ["apereo", "cas", "oss"]
      }
    }
  }
}
```

If the attribute is not marked as *structured*, then the final ID token that would be produced by CAS takes on the following form:
{% include googlead1.html  %}
```json
{ 
  "iss": "http://sso.example.org/cas/oidc", 
  "sub": "casuser", 
  "org.apereo.cas.entity": ["apereo", "cas", "oss"]
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html