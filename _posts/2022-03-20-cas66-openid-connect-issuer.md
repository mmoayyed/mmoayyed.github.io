---
layout:     post
title:      Apereo CAS - OpenID Connect Issuers & Aliases
summary:    Learn how to tune your Apereo CAS deployment as an OpenID Connect provider to respond to authentication requests from multiple hosts with different issuer patterns and aliases.
tags:       ["CAS 6.6.x", "OpenID Connect"]
---

If your Apereo CAS deployment is configured to act as an OpenID Connect provider, then you will need to be careful with how you define the required issuer setting. In this blog post, we will examine the range of options available to define and tune the issuer value for Apereo CAS acting as an OpenID Connect provider. 
{% include googlead1.html  %}
Our starting position is based on the following:

- CAS `6.6.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Overview

An issuer identifier, in OpenID Connect terms, is a case-sensitive URL using the `https` scheme that contains scheme, host, and optionally, port number and path components and no query or fragment components. This URL uniquely identifies the CAS server instance as an OpenID Connect provider and is a point for resolving important metadata about the server, such as its endpoints and capabilities.

## Configuration

When Apereo CAS is configured as an OpenID Connect provider, this issuer is defined in the CAS configuration as:
{% include googlead1.html  %}
```properties
cas.authn.oidc.core.issuer=https://sso.example.org/cas/oidc
```

A client application need not know the issuer beforehand, since this setting can be determined *dynamically* using dynamic discovery. OpenID Connect defines a discovery mechanism, called *OpenID Connect Discovery*, which allows the CAS server to publish its metadata, including its issuer, at a well-known URL which typically is:

```
https://sso.example.org/.well-known/openid-configuration
```

This URL returns a JSON listing of the various endpoints, supported scopes and claims, public keys used to sign the tokens, and other details. The clients can use this information to construct a request to the CAS server.
{% include googlead1.html  %}
```json
{
  "issuer": "https://sso.example.org/cas/oidc",
}
```

## Issuer Per Relying Party

The issuer value is also put into issued ID tokens under the `iss` claim. The specification indicates that the issuer identifier for the CAS OpenID Connect provider (which is typically obtained during Discovery) **MUST** exactly match the value of the `iss` (issuer) claim. Given our previous examples, the `iss` claim would always be `https://sso.example.org/cas/oidc`.
{% include googlead1.html  %}
In *very extreme and special circumstances*, you may decide to override the `iss` claim to handle a particularly-weird integration for an OpenID Connect relying party. CAS provides an option to override the issuer for a given client application:

```json
{
  "@class": "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "client",
  "clientSecret": "client",
  "serviceId": "^http://localhost:8080.*",
  "name": "OIDC",
  "id": 1,
  "scopes" : [ "java.util.HashSet", [ "profile", "openid" ] ],
  "idTokenIssuer": "https://sso.example.org/custom/issuer"
}
```

<div class="alert alert-warning">
  <strong>Remember</strong><br/>This is an optional setting which should only be used in special circumstances. Do NOT use this setting carelessly as the ID token’s issuer <strong>MUST ALWAYS</strong> match the identity provider’s issuer.
</div>

## Issuer Aliases

The CAS adopter is also given the option to configure issuer *aliases* in form of regular expression patterns. An issuer alias,
{% include googlead1.html  %}
>  Defines the regular expression pattern that is matched against the calculated issuer from the request. If the issuer that is extracted from the request does not match the issuer defined in the CAS configuration, this pattern acts as a secondary level rule to allow incoming requests to pass through if the match is successful. 

Issuer aliases allow CAS to migrate easily from one issuer URL to another. You also have the means to identify the CAS OpenID Connect server by multiple issuer URLs.

As an example, suppose that your CAS server running on `localhost:8443` defines the following issue:

```properties
cas.authn.oidc.core.issuer=https://sso.example.org/cas/oidc
```

The following request will produce an error if you decide to send a request to the JWKS endpoint:
{% include googlead1.html  %}
```bash
> curl https://localhost:8443/cas/oidc/jwks

{"error":"invalid_request","error_description":"Invalid issuer"}
```

This, however, will produce the expected response:

```bash
> curl https://sso.example.org/cas/oidc/jwks

{"keys": [...]}
```

Let's define our issuer alias pattern to support requests from `localhost:
{% include googlead1.html  %}
```properties
cas.authn.oidc.core.accepted-issuers-pattern=https:\/\/localhost:8443.*
```

<div class="alert alert-info">
  <strong>Remember</strong><br/>The default behavior is to respond to requests and issue tokens under the main issuer setting. Issuer aliases and the extracted issuers from the request that match an alias do not alter the resulting issuer that is produced by the CAS server.
</div>

Now, this request should also produce the expected response:

```bash
> curl https://localhost:8443/cas/oidc/jwks

{"keys": [...]}
```

## Issuer Customizations

You can certainly control the issuer calculation and validation logic yourself by supplying the following bean in your CAS configuration:
{% include googlead1.html  %}
```java
@Bean
public OidcIssuerService oidcIssuerService() {
    return new MyOidcIssuerService();
}
```

## Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
