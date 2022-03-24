---
layout:     post
title:      Shibboleth IdP - SAML2 Authentication Flows w/ Refeds MFA
summary:    An overview of the external SAML2 identity selection and discovery strategy in the Shibboleth Identity Provider while taking into requested authentication contexts, specifically for Refeds MFA.
tags: ["Shibboleth Identity Provider"]
---

The Shibboleth Identity Provider supports a [SAML authentication flow](https://shibboleth.atlassian.net/wiki/spaces/IDP4/pages/1282539600/SAMLAuthnConfiguration). This login flow supports the use of a separate SAML 2.0 identity provider to authenticate the user, with the IdP acting as a SAML proxy. This blog post provides a quick overview of the external identity selection and discovery strategy for advanced login flows while taking into requested authentication contexts.

{% include googlead1.html  %}
Our starting position is based on the following:

- Shibboleth Identity Provider `4.1.x`
- Java `11`


## Overview

Let's consider that we have two Okta integration routes, each of which is configured to act as a SAML2 identity provider. Okta instance `A` is *NOT* capable of handling multifactor authentication requests and as such can only handle `urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport` or unknown/unspecified authentication context classes. 
{% include googlead1.html  %} Okta instance `B` on the other hand, is capable of doing multifactor authentication and should be the designated identity provider for `https://refeds.org/profile/mfa` authentication context classes. 

## Configuration 

To handle this integration, the identity provider metadata for each Okta integration must first be specified in the `metadata-providers.xml`:

```xml
<MetadataProvider id="OktaHTTPMetadataA"
                  xsi:type="FileBackedHTTPMetadataProvider"
                  backingFile="%{idp.home}/metadata/oktaA.xml"
                  metadataURL="https://...">
</MetadataProvider>

<MetadataProvider id="OktaHTTPMetadataB"
                  xsi:type="FileBackedHTTPMetadataProvider"
                  backingFile="%{idp.home}/metadata/oktaB.xml"
                  metadataURL="https://...">
</MetadataProvider>
```

{% include googlead1.html  %}
Then, we will need to include the entity ID of the two identity providers in our `idp.properties` file:

```properties
idp.refeds.entityId=...
idp.default.entityId=...
```

Then, we can modify the `global.xml` configuration file to include our logic for selection discovery:

```xml
<util:map id="OktaIntegrationsMap">
     <entry key="oktaWithRefedsMfa" value="%{idp.refeds.entityId}" />
     <entry key="oktaWithoutRefedsMfa" value="%{idp.default.entityId}" />
</util:map>

<bean id="shibboleth.authn.SAML.discoveryFunction" 
     parent="shibboleth.ContextFunctions.Scripted"
     factory-method="inlineScript"
     c:outputType="java.lang.String"
     p:customObject-ref="OktaIntegrationsMap"
     p:hideExceptions="true">
     <constructor-arg name="scriptSource">
          <value>
               <![CDATA[
               logger = Java.type("org.slf4j.LoggerFactory").getLogger("net.shibboleth.idp.authn");
               authCtx = input.getSubcontext("net.shibboleth.idp.authn.context.AuthenticationContext");
               rprinCtx = authCtx.getSubcontext("net.shibboleth.idp.authn.context.RequestedPrincipalContext");
               
               var idpToUse = "";
               if (rprinCtx != null) {
                    authnContextClassPrincipal
                         = Java.type("net.shibboleth.idp.saml.authn.principal.AuthnContextClassRefPrincipal");
                    mfaSignal = new authnContextClassPrincipal("https://refeds.org/profile/mfa");
                    if ( rprinCtx.getRequestedPrincipals().contains(mfaSignal) ) {
                         idpToUse = custom.get("oktaWithRefedsMfa");
                         logger.debug("SP for which REFEDS MA is required, use " + idpToUse);
                    } else {
                         idpToUse = custom.get("oktaWithoutRefedsMfa");
                         logger.debug("SP with no REFEDS MFA requirement, use " + idpToUse);
                    }
               } else { // Just in case context is null
                    idpToUse = custom.get("oktaWithoutRefedsMfa");
                    logger.debug("SP with no REFEDS MFA requirement, use " + idpToUse);
               }

               logger.info("IDP discovery process has selected " + idpToUse);
               idpToUse;
          ]]>
          </value>
     </constructor-arg>
</bean>
```

{% include googlead1.html  %}
The Shibboleth Identity Provider will invoke our discovery function above to determine the external identity provider. Our script examines the requested authentication context class and will choose the appropriate provider accordingly. In case no authentication context class is requested, the script will choose the default identity provider.

Big thanks to [Mike Grady](https://www.linkedin.com/in/mapgrady) who's the original author of the script. I only should take credit for minor customizations, particularly for injecting the `custom` object.

## Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)


[Misagh Moayyed](https://fawnoos.com)