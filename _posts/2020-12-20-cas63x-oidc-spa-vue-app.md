---
layout:     post
title:      Apereo CAS - Securing a Vue.js SPA with OpenID Connect
summary:    Learn how to secure a Vue.js application using OpenID Connect with PKCE and Apereo CAS as an OpenID Connect identity provider.
tags:       [CAS]
---

This blog post demonstrates how to set up a [Vue.js](https://vuejs.org/) SPA application to authenticate and authorize using OpenID Connect Code flow with PKCE. The [Vue OIDC Client](https://github.com/soukoku/vue-oidc-client) sample application is used to implement the client-side authentication logic and validation logic and the Apereo CAS server is used to act as an OpenID Connect identity provider.

{% include googlead2.html  %}

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- [Vue OIDC Client](https://github.com/soukoku/vue-oidc-client)

## Configuration

Once you have the correct modules in the WAR overlay for [OpenID Connect](https://apereo.github.io/cas/6.3.x/installation/OIDC-Authentication.html), you will need to make sure the client application is [registered with CAS](https://apereo.github.io/cas/6.2.x/services/JSON-Service-Management.html) as a relying party:

```json
{
  "@class": "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "client",
  "serviceId": "^http://localhost:8080.*",
  "name": "OIDC",
  "id": 1,
  "scopes" : [ "java.util.HashSet", [ "profile", "openid" ] ]
}
```

Our client application will be running on `http://localhost:8080`, and the identity provider will be at `https://sso.example.org/cas/oidc`. Given the SPA nature of the client, we need to make sure CORS requests are allowed by the client to reach out to the identity provider's OIDC endpoints for discovery, token exchange, and profile retrieval. For simplicity and testing purposes only, the following settings should enable the proper CORS filter for CAS that allow all origins:

{% include googlead1.html  %}

```
cas.http-web-request.cors.enabled=true
cas.http-web-request.cors.allow-origins[0]=*
```

## Client Application

The [Vue OIDC Client](https://github.com/soukoku/vue-oidc-client) is already configured to talk to an OIDC identity provider. We just have to adjust the configuration located in the `sample/auth.js` to have the application point to our CAS server:

```js
var mainOidc = createOidcAuth(
  'main',
  SignInType.Popup,
  appRootUrl,
  {
    authority: 'https://sso.example.org/cas/oidc/',
    client_id: 'client',
    response_type: 'code',
    scope: 'openid profile email api'
  },
  console,
  LogLevel.Debug
)
```

Next, navigate to the `sample` directory and run:

```bash
# brew install yarn
yarn serve
```

Note that if the CAS server is running behind self-signed certificates for TLS, you can disable strict-SSL checking for demo and testing purposes before building and serving the client application:

```bash
yarn config set "strict-ssl" false
```

Refer to the official [Yarn website](https://classic.yarnpkg.com/en/) for additional details.

## Testing

Once you bring up the client application, the home page allows you login using an **About (Protected)** link at `http://localhost:8080/about`:

{% include image.html img="https://user-images.githubusercontent.com/1205228/102646708-c496d680-4179-11eb-9ece-e54c37108736.png" width="80%" title="Vue.js OpenID Connect Client Application Home Page" %}

{% include googlead1.html  %}

Once you have successfully logged in and exchanged tokens with CAS, you should be greeted with the following page:

{% include image.html img="https://user-images.githubusercontent.com/1205228/102646820-f5770b80-4179-11eb-97ac-04cea7f260c5.png" width="80%" title="OpenID Connect Vue.js Successful Login" %}


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html