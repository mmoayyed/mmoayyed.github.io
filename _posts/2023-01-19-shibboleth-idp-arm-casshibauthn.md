---
layout:     post
title:      Shibboleth Identity Provider - Docker Deployments on Apple Silicon & ARM
summary:   Learn how to run the Shibboleth Identity Provider on macOS ARM-based machines and connect it to an external Apereo CAS identity provider for authentication and single sign-on.
tags:       ["Shibboleth Identity Provider", "SAML", "Docker"]
---

This is a review of how to run the Shibboleth Identity Provider on ARM-based machines (i.e. Apple Silicon) via Docker, and ultimately configure the Shibboleth Identity Provider to delegate authentication requests to an external Apereo CAS server.

{% include googlead1.html %}

This tutorial specifically focuses on:

- Shibboleth Identity Provider `4.3.x`
- Java `11`
- [Shib-CAS AuthN](https://github.com/Unicon/shib-cas-authn)

# Deployment

Internet2 publishes [multi-arch Docker images](https://hub.docker.com/r/i2incommon/shib-idp/tags) that run on Rocky 8. One could use these images as a base image in a `Dockerfile`:

```docker
FROM i2incommon/shib-idp:4.3.0_20230118_rocky8_multiarch
```

Local artifacts can always be injected and overlaid into the final image. For example, if you have your configuration inside an `idp` directory, configuration files can be put and burned into the image as such:

```docker
COPY idp/web.xml /opt/shibboleth-idp/edit-webapp/WEB-INF
COPY idp/authn.properties /opt/shibboleth-idp/conf/authn
COPY idp/logback.xml /opt/shibboleth-idp/conf
COPY idp/metadata-providers.xml /opt/shibboleth-idp/conf
COPY idp/attribute-filter.xml /opt/shibboleth-idp/conf
COPY idp/sp-metadata.xml /opt/shibboleth-idp/metadata
```

You may also choose to enable certain modules and plugins. In particular, enabling the External Authentication plugin would be required for integrations with an external CAS server:

```docker
RUN ls /opt/shibboleth-idp && \
    chmod +x /opt/shibboleth-idp/bin/*.sh && \
    /opt/shibboleth-idp/bin/build.sh -Didp.target.dir="/opt/shibboleth-idp" && \
    /opt/shibboleth-idp/bin/module.sh -e idp.authn.External && \
    ...
```

# Shib-CAS AuthN

[Shib-CAS AuthN](https://github.com/Unicon/shib-cas-authn) is a Shibboleth IdP external authentication plugin that delegates primary authentication to an external Single Sign On Server using the CAS protocol. The advantage of using this component is the ability to utilize a full range of native CAS protocol features such as `renew` and `gateway`, plus the ability to share with CAS the `EntityID` of the relying application.

The plugin takes advantage of and extends the Shibboleth IdP's external authentication flow, and consists of several JAR artifacts that bridge the gap between Shibboleth and CAS.

Docker images may choose to build the Shibboleth Identity Provider with the [Shib-CAS AuthN plugin](https://github.com/Unicon/shib-cas-authn/releases) as such:

```docker
COPY shibcasauthn/no-conversation-state.jsp /opt/shibboleth-idp/edit-webapp
COPY shibcasauthn/cas-client-core-3.6.0.jar /opt/shibboleth-idp/edit-webapp/WEB-INF/lib
COPY shibcasauthn/shib-cas-authenticator-4.3.0.jar /opt/shibboleth-idp/edit-webapp/WEB-INF/lib
```

Finally, the configuration of the Shib-CAS AuthN as well as instructions for the Shibboleth Identity Provider's external authentication flow may be defined in `authn.properties` as:

```properties
idp.authn.External.externalAuthnPath=contextRelative:Authn/External
idp.authn.External.passiveAuthenticationSupported=true
idp.authn.External.forcedAuthenticationSupported=true

idp.authn.flows = External

shibcas.casServerUrlPrefix = https://sso.example.org/cas
shibcas.casServerLoginUrl = ${shibcas.casServerUrlPrefix}/login

shibcas.serverName = https://localhost:9443

idp.authn.External.supportedPrincipals = \
    saml2/urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport, \
    https://refeds.org/profile/mfa
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html