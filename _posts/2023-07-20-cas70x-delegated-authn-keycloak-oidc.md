---
layout:     post
title:      Apereo CAS - Delegated Authentication with Keycloak
summary:    Learn how to use Keycloak as an external OpenID Connect identity provider and connect it to CAS for a delegated/proxy authentication scenario.
tags:       ["CAS 7.0.x", "Delegated Authentication", "OpenID Connect", "Docker", "Keycloak"]
---

Apereo CAS has had support to delegate authentication to [external OpenID Connect identity providers][delegation] for quite some time. In a CAS context, *delegation* is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate identity provider endpoint, and on the return trip back, CAS is tasked to shake hands, parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. In other words, in delegated scenarios, the main identity provider is an external system and CAS simply begins to act as a client or proxy in between.

{% include googlead1.html %}
In this blog post, we will start from a modest CAS client application that speaks the CAS protocol that is integrated with CAS and will be using [Keycloak][keycloak] as our external OpenID Connect identity provider to accommodate the following authentication flow:

- User accesses the CAS client application.
- User is redirected to the CAS server, acting as a CAS-Protocol identity provider.
- CAS, now acting as an OIDC client itself, lets the user delegate the flow to Keycloak.
- User logs in using Keycloak credentials and is redirected back to CAS.
- CAS establishes an SSO session and redirects the user back to the CAS client application.
- CAS client application validates the ticket and response from CAS and allows the user to log in.
{% include googlead1.html  %}

Our starting position is as follows:

- CAS `7.0.x`
- Java `21`

## Keycloak

[Keycloak][keycloak] is an open-source identity provider that provides user federation, strong authentication, user management, fine-grained authorization, and more. Keycloak can also authenticate users with existing OpenID Connect or SAML 2.0 Identity Providers. Again, this is just a matter of configuring the Identity Provider through the admin console.

We can run Keycloak using Docker:
{% include googlead1.html  %}
```bash
docker run --rm --name keycloak \
  -p 8989:8443 -p 8988:8080 \
  -e KC_HTTPS_CERTIFICATE_FILE=/opt/keycloak/conf/server.crt \
  -e KC_HTTPS_CERTIFICATE_KEY_FILE=/opt/keycloak/conf/server.key \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v /path/to/server.crt:/opt/keycloak/conf/server.crt \
  -v /path/to/server.key:/opt/keycloak/conf/server.key \
  -v /path/to/keycloak/import:/opt/keycloak/data/import:ro \
  quay.io/keycloak/keycloak:latest \
  start-dev --import-realm
```

A few points to consider:

- `/path/to/keycloak/import` must exist which allows the Keycloak server to try to import any realm configuration file. Only regular files using the `.json` extension are read from this directory, sub-directories are ignored.
- Likewise, `/path/to/server.crt` and `/path/to/server.key` must also exist which allow the Keycloak server to run under a secure port, `8443`, and a secure connection with `https`.
{% include googlead1.html  %}
- As you also observe, the keycloak admin credentials are set to `admin` and `admin` for username and password respectively.

The realm configuration required for this setup that Keycloak shall import from a file must be called `cas` and it must then contain a registered client application entry with `openid-connect` as the designated protocol. You will need to grab the application's client id and secret to continue to the next step.

## CAS Configuration

Once you have the correct modules in your CAS build for [Delegated Authentication][delegation], you will need to make sure CAS can hand off authentication to Keycloak:

{% include googlead1.html  %}
```
cas.authn.pac4j.oidc[0].generic.id=...
cas.authn.pac4j.oidc[0].generic.secret=...
cas.authn.pac4j.oidc[0].generic.client-name=Keycloak

# Note the realm name in the discovery URL...
cas.authn.pac4j.oidc[0].generic.discovery-uri=https://localhost:8989/realms/cas/.well-known/openid-configuration

cas.authn.pac4j.oidc[0].generic.principal-id-attribute=email

cas.authn.pac4j.oidc[0].generic.preferred-jws-algorithm=RS256
cas.authn.pac4j.oidc[0].generic.client-authentication-method=client_secret_basic
cas.authn.pac4j.oidc[0].generic.supported-client-authentication-methods=client_secret_basic,client_secret_post
```

A few points to consider here as well:

- We are instructing CAS to use the `email` attribute supplied by Keycloak when building the authenticated subject and the linked SSO session.
- `client-authentication-method` indicates our preferred authentication strategy when requests are sent to Keycloak to exchange tokens.
{% include googlead1.html  %}
- `supported-client-authentication-methods` indicates what authentication options our CAS integration with Keycloak can support.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[delegation]: https://apereo.github.io/cas/7.0.x/integration/Delegate-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[keycloak]: https://www.keycloak.org/