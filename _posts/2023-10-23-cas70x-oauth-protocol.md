---
layout:     post
title:      Apereo CAS - OAuth 2.0 Protocol & Identity Provider
summary:    Learn how to configure Apereo CAS to act as an OAuth 2.0 identity provider.
tags:       ["CAS 7.0.x", "Authentication", "OpenID Connect"]
---

OAuth 2.0 is the industry-standard protocol for authorization and focuses on client developer simplicity while providing specific authorization flows for web applications, desktop applications, mobile phones, and more. In this blog post, we will delve into the world of OAuth2 with Apereo CAS to explore how Apereo CAS seamlessly integrates this framework to provide a powerful and adaptable solution for modern authentication needs.

{% include googlead1.html  %}

This tutorial specifically focuses on:

- CAS `7.0.x`
- Java `21`

# Setup

The typical setup is quite simple once you include the [relevant extension module](https://apereo.github.io/cas/7.0.x/authentication/OAuth-Authentication.html) in your build. Once you have a functioning build, you can begin registering your OAuth client applications with CAS whose registration record may likely be managed in [flat JSON files](https://apereo.github.io/cas/7.0.x/services/JSON-Service-Management.html):
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.support.oauth.services.OAuthRegisteredService",
  "clientId": "client",
  "clientSecret": "secret",
  "serviceId" : "https://my.application.com",
  "bypassApprovalPrompt": true,
  "name" : "Sample",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "email", "organization" ] ]
  },
  "supportedGrantTypes": [ "java.util.HashSet", [ "authorization_code" ] ],
  "supportedResponseTypes": [ "java.util.HashSet", [ "code" ] ]
}
```

# Authorization Code Flow

The Authorization Code Flow is one of the widely used and most secure OAuth 2.0 grant types for obtaining an access token to access protected resources on behalf of a user. This flow is designed to keep the user's credentials secure and is commonly used in web applications. Here's how the Authorization Code Flow works:

- **User Initiates the Flow**: The process begins when a user tries to access a protected resource on a client application (e.g., a web or mobile app). The client application redirects the user to CAS with specific parameters, including the requested scope, client ID, and a redirect URI:
{% include googlead1.html  %}
```bash
https://localhost:8443/cas/oauth2.0/authorize \
  ?response_type=code&redirect_uri=https://my.application.com \
  &client_id=client&scope=profile
```

- **User Authorization**: The user is prompted to log in and authorize the client application to access their protected resources. The user may need to enter their credentials on the CAS login page. After successful authentication, CAS asks the user to grant or deny the client's request. In our setup, this approval is bypassed and skipped via the `bypassApprovalPrompt` flag.

- **Authorization Code**: If the user grants permission, CAS generates an authorization code and sends it to the client application's specified redirect URI. This code is short-lived and is not the actual access token:

```bash
302 https://my.application.com?code=OC-1234567890
```

- **Client Requests Access Token**: The client application, now in possession of the authorization code, sends a confidential request to CAS, including the authorization code and client secret. The client also specifies the same redirect URI used in the initial request:
{% include googlead1.html  %}
```bash
POST https://localhost:8443/cas/oauth2.0/token \
  ?client_id=client&client_secret=secret \
  &redirect_uri=https://my.application.com \
  &grant_type=authorization_code&code=OC-1234567890
```

- **Authorization Server Validates and Responds**: CAS validates the request. If everything checks out (valid code, matching redirect URI, and correct client secret), it responds with an access token:

```json
{
  "access_token": "AT-31-XS5becYUaPk1RFl9kM9ZCSEIYf5t57nO",
  "token_type": "Bearer",
  "expires_in": 28800,
  "scope": "profile"
}
```

- **Client Accesses Protected Resource**: The client can use the access token to make requests to the resource server on behalf of the user. The access token provides the necessary permissions to access the user's data.

# JWT Access Tokens

In OAuth 2.0, a JWT (JSON Web Token) access token is a type of access token that is represented as a JSON object. Unlike traditional access tokens, like the one you see above, which are typically opaque and require a separate server-side lookup to validate, JWT access tokens contain information in a self-contained format. This self-contained nature makes JWTs more efficient and suitable for certain use cases.

Some of the key characteristics of a JWT access token could be:
{% include googlead1.html  %}
- **Self-Contained**: A JWT access token contains information about the user and the associated permissions or claims within the token itself. This means that the recipient of the token can inspect and use the information without the need for additional calls to an authorization server.

- **Claims**: The JWT access token includes claims (key-value pairs) that provide information about the user, the token's validity, and the scope of access. Common claims include the user's ID, token expiration time, and the permissions granted.

- **Digital Signature**: To ensure the integrity and authenticity of the token, a JWT access token is often signed with a digital signature by CAS. This signature can be verified by the resource server to ensure the token hasn't been tampered with.
{% include googlead1.html  %}
- **Stateless**: Since JWTs are self-contained, they are often used in stateless authentication and authorization scenarios. The resource server can independently verify the token's authenticity without making additional calls to an authorization server.

- **Expiration**: JWT access tokens have an expiration time (specified in the exp claim). This ensures that the token is only valid for a certain period, improving security.

To receive a JWT access token, you can modify the application policy as such:
{% include googlead1.html  %}
```yaml
{
  "@class" : "org.apereo.cas.support.oauth.services.OAuthRegisteredService",
  "clientId": "client",
  "clientSecret": "secret",
  "serviceId" : "https://my.application.com",
  # ... other fields listed here ...
  "jwtAccessToken": true
}
```

Or, if you prefer to do this globally for all applications and requests:

```properties
cas.authn.oauth.access-token.create-as-jwt=true
```

# Refresh Tokens

A refresh token is a component of the OAuth 2.0 authorization framework and is a credential that can be used to obtain a new access token once the original access token has expired. Access tokens issued by CAS have a limited lifespan. When an access token expires, the client application can no longer use it to access protected resources. To maintain access, the client application can present the refresh token to CAS and upon receiving a valid refresh token, CAS issues a new access token, typically with a new expiration time.

To receive a refresh token, you can modify the application policy as such:
{% include googlead1.html  %}
```yaml
{
  "@class" : "org.apereo.cas.support.oauth.services.OAuthRegisteredService",
  "clientId": "client",
  "clientSecret": "secret",
  "serviceId" : "https://my.application.com",
  # ... other fields listed here ...
  "generateRefreshToken": "true"
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
