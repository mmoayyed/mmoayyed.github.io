---
layout:     post
title:      Apereo CAS - SAML2 Delegated Authentication Flows w/ Refeds MFA
summary:    An overview of the external SAML2 identity selection and discovery strategy in Apereo CAS while taking into requested authentication contexts, specifically for Refeds MFA.
tags:       ["CAS 6.6.x", "SAML", "Groovy", "Delegated Authentication"]
---

If your Apereo CAS deployment is configured to act as a SAML2 identity provider, you may run into a use case where the authentication flow should be routed to a separate and external SAML 2.0 identity provider to authenticate the user, with CAS acting as a SAML proxy. This is what Apereo CAS refers to as [delegated authentication](https://apereo.github.io/cas/6.6.x/integration/Delegate-Authentication.html). {% include googlead1.html  %} This blog post provides a quick overview of the external identity selection and discovery strategy for advanced login flows while taking into requested authentication contexts.

Our starting position is based on the following:

- CAS `6.6.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

A similar topic that covers the Shibboleth Identity Provider is also [available here](/2022/03/24/shibboleth-idp-saml-authn).

## Overview

Let's consider that we have two Okta integration routes, each of which is configured to act as a SAML2 identity provider. Okta instance `A` is *NOT* capable of handling multifactor authentication requests and as such can only handle `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport` or unknown/unspecified authentication context classes. 
{% include googlead1.html  %} Okta instance `B` on the other hand, is capable of doing multifactor authentication and should be the designated identity provider for `https://refeds.org/profile/mfa` authentication context classes. 

A sample authentication request sent from a SAML2 service provider that requires MFA follows:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<saml2p:AuthnRequest xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol" 
Destination="https://sso.example.org/cas/idp/profile/SAML2/Redirect/SSO" 
ForceAuthn="false" ID="a4g1642ifh57he3ejb2f1j69b8ic11" 
IsPassive="false" IssueInstant="2022-03-25T07:25:34.713Z" 
ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Version="2.0">
   <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
   https://spring.io/security/saml-sp</saml2:Issuer>
   <saml2p:NameIDPolicy AllowCreate="true"/>
   <saml2p:RequestedAuthnContext Comparison="exact">
      <saml2:AuthnContextClassRef xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
      https://refeds.org/profile/mfa</saml2:AuthnContextClassRef>
   </saml2p:RequestedAuthnContext>
</saml2p:AuthnRequest>
```

## Configuration 

To handle this integration, we first need to start by registering the service provider with our CAS server:

```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "https://spring.io/security/saml-sp",
  "name": "SAML",
  "id": 1,
  "metadataLocation": "/path/to/sp-metadata.xml"
}
```

Then, we need to define our two Okta identity providers per instructed [laid out here](https://apereo.github.io/cas/6.6.x/integration/Delegate-Authentication.html):
{% include googlead1.html  %}
```
...
cas.authn.pac4j.saml[0].client-name=OktaA
cas.authn.pac4j.saml[0].identity-provider-metadata-path=https://.../sso/saml/metadata
...
cas.authn.pac4j.saml[0].client-name=OktaB
cas.authn.pac4j.saml[0].identity-provider-metadata-path=https://.../sso/saml/metadata
...
```

<div class="alert alert-info">
  <strong>Note</strong><br/>I am only highlighting the required settings here that are relevant to the post. In reality, you might need a few more settings to properly set up an external SAML2 identity provider.
</div>

{% include googlead1.html  %}
Finally, we need to instruct CAS to handle the discovery and redirection strategy. This can be done using a groovy script:

```
cas.authn.pac4j.core.groovy-redirection-strategy.location=file:/path/to/Redirection.groovy
```

The script itself is as follows:

{% include googlead1.html  %}
```groovy
import org.apereo.cas.web.*
import org.opensaml.saml.saml2.core.*
import org.apereo.cas.support.saml.*
import org.apache.commons.lang3.tuple.*
import org.pac4j.core.context.*
import org.apereo.cas.pac4j.*
import org.apereo.cas.web.support.*
import org.opensaml.core.xml.schema.*
import java.util.stream.*
import org.apereo.cas.configuration.model.support.delegation.*

def run(Object[] args) {
    def requestContext = args[0]
    def service = args[1]
    def registeredService = args[2]
    def providers = args[3] as Set<DelegatedClientIdentityProviderConfiguration>
    def appContext = args[4]
    def logger = args[5]

    /**
      Make sure our configuration holds SAML2
      identity providers for delegation. This is an
      extra safety check and may be removed.
    */
    if (providers.stream().noneMatch(provider -> {
            return provider.type.equalsIgnoreCase("saml2")
        })) {
        logger.info("No SAML2 providers found")
        return null;
    }
    
    /**
    Minor boilerplate to get access to components that assist with locating the
    saml2 authn request sent by the SP
    */
    def request = WebUtils.getHttpServletRequestFromExternalWebflowContext(requestContext)
    def response = WebUtils.getHttpServletResponseFromExternalWebflowContext(requestContext)
    def webContext = new JEEContext(request, response)
    def sessionStore = appContext.getBean(DistributedJEESessionStore.DEFAULT_BEAN_NAME)
    def openSamlConfigBean = appContext.getBean(OpenSamlConfigBean.DEFAULT_BEAN_NAME)

    /**
      Locate the SAML2 authentication request sent by the SP
      so we may examine the requested authn context class, if any.
    */
    def result = SamlIdPUtils.retrieveSamlRequest(webContext,
                sessionStore, openSamlConfigBean, AuthnRequest.class)
      .map(Pair::getLeft)
      .map(AuthnRequest.class::cast);

    /**
      Locate the two identity providers
    */
    def oktaA = providers.find { it.name.equals "OktaA" }
    def oktaB = providers.find { it.name.equals "OktaB" }

    if (result.isPresent()) {
        def authnRequest = result.get()
        def requestedAuthnContext = authnRequest.getRequestedAuthnContext()
        def refs = []

        /**
          Build up a list of all requested authn context classes
          from the saml2 authentication request.
        */
        if (requestedAuthnContext != null 
            && requestedAuthnContext.getAuthnContextClassRefs() != null
            && !requestedAuthnContext.getAuthnContextClassRefs().isEmpty()) {
            refs = requestedAuthnContext.getAuthnContextClassRefs()
                .stream()
                .map(XSURI::getURI)
                .collect(Collectors.toList())
        }

        if (refs.contains("https://refeds.org/profile/mfa")) {
            logger.info("Found refeds MFA for provider ${oktaB.name}")
            return oktaB
        }
    }
    logger.info("Using default provider ${oktaA.name}")
    return oktaA
}
```
{% include googlead1.html  %}

<div class="alert alert-info">
  <strong>Note</strong><br/>While this surely is not perfect Groovy, it is Groovy nonetheless. There is no weird syntax here. All features and functions that are supported by the Groovy language can be accepted and compiled here. You can be as creative as you like, but not too creative!
</div>

CAS will invoke our groovy script above to determine the external identity provider. Our script examines the requested authentication context class and will choose the appropriate provider accordingly. In case no authentication context class is requested, the script will choose the default identity provider.

## Redirection Strategy

One thing to note here is that the auto-redirection strategy for the selected identity provider by default happens on the client side. This behavior can be controlled for the selected provider itself:

```groovy
oktaB.autoRedirectType = DelegationAutoRedirectTypes.CLIENT
// Or...
oktaB.autoRedirectType = DelegationAutoRedirectTypes.SERVER
```
{% include googlead1.html  %}
To learn more about redirection strategies, see [this post](/2021/10/27/cas65-delegated-authn-redirect/).

## Authentication Context Class

Once you return from the chosen identity provider, you may wish to manipulate the authenication context class that is ultimately put into the SAML2 response and sent back to the original Service Provider.

One easy way would be to specify and overwrite the context class for the service provider:
{% include googlead1.html  %}
```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "https://spring.io/security/saml-sp",
  "name": "SAML",
  "id": 1,
  "metadataLocation": "/path/to/sp-metadata.xml",
  "requiredAuthenticationContextClass": "https://refeds.org/profile/mfa",
}
```

If that is not good enough, you could always script the logic as well:
{% include googlead1.html  %}
```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "https://spring.io/security/saml-sp",
  "name": "SAML",
  "id": 1,
  "metadataLocation": "/path/to/sp-metadata.xml",
  "requiredAuthenticationContextClass": "file:///path/to/GroovyScript.groovy",
}
```

The script itself may be designed as:
{% include googlead1.html  %}
```groovy
def run(final Object... args) {
    def samlContext = args[0]
    def logger = args[1]
    
    logger.info("Building context for entity {}", samlContext.adaptor.entityId)
    /**
      This is where you calculate the final context class...
    */
    return "https://refeds.org/profile/mfa"
}
```

The compiled script is cached for faster subseqeunt executions.

## Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
