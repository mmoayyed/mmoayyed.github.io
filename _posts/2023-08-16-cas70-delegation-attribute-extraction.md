---
layout:     post
title:      Apereo CAS - Delegated Authentication & Groovy Attribute Extraction
summary:    Learn how to delegate and hand off authentication to an external SAML2 identity provider, and script the extraction of attributes from the identity provider response using Groovy.
tags:       ["CAS 7.0.x", "Delegated Authentication", "Groovy", "SAML2"]
---

When setting up Apereo CAS to delegate authentication to [external identity providers][delegation], it may be desirable to manipulate the claims and attributes received from the identity provider to transform values from one syntax to another. For example, an identity provider might return the attribute `employeeId` with the value of `123456` back to CAS whereupon custom extraction logic would capture that attribute value as `EPL-123456` instead, and would record it under a new name, `employeeReference` to be used for release to client applications.

{% include googlead1.html  %}

In this blog post, we will take a look at strategies to hand off the authentication flow to an external SAML2 identity provider and to script the extraction of attributes from the response. 

Our focus is based on the following:

- CAS `7.0.x`
- Java `21`

# Configuration

Once you have prepared your CAS build for [delegated authentication][delegation], the basic configuration requires handing off authentication to an external SAML2 identity provider as follows:

{% include googlead1.html  %}

```
cas.authn.pac4j.saml[0].keystore-password=...
cas.authn.pac4j.saml[0].private-key-password=...
cas.authn.pac4j.saml[0].service-provider-entity-id=...
cas.authn.pac4j.saml[0].metadata.service-provider.file-system.location=...
cas.authn.pac4j.saml[0].keystore-path=...
cas.authn.pac4j.saml[0].metadata.identity-provider-metadata-path=...
cas.authn.pac4j.saml[0].client-name=SAML2Client
```

# Attribute Conversion

As it stands out, delegated authentication and attribute extraction in CAS is handled by the [Pac4j][pac4j] library, which provides a flexible way for us to collect attributes from the response. For example, in its simplest form, we could instruct CAS to capture the attribute `phone` from the profile and record it under the name `phoneNumber`:

{% include googlead1.html  %}

```
cas.authn.pac4j.saml[0].mapped-attributes[0]=phone->phoneNumber
```

There are more advanced options for attribute conversion and mapping. For example, the default converter extracts the attribute definition and records it into the CAS-authenticated user profile as:
{% include googlead1.html  %}
```java
var attribute = (Attribute) a;
var samlAttribute = new SAML2AuthenticationCredentials.SAMLAttribute();
samlAttribute.setFriendlyName(attribute.getFriendlyName());
samlAttribute.setName(attribute.getName());
samlAttribute.setNameFormat(attribute.getNameFormat());
attribute.getAttributeValues()
    .stream()
    .map(XMLObject::getDOM)
    .filter(dom -> dom != null && dom.getTextContent() != null)
    .forEach(dom -> samlAttribute.getAttributeValues().add(dom.getTextContent().trim()));
return samlAttribute;
```

If you are unhappy with the default rules, you can always instruct CAS to load your  attribute converter:

```
cas.authn.pac4j.saml[0].saml2-attribute-converter=org.example.cas.MyAttributeConverter
```

Your `MyAttributeConverter` must of course be packaged with CAS with the following general form:

```java
import org.pac4j.core.profile.converter.*;

public class MyAttributeConverter extends AbstractAttributeConverter {
}
```

Furthermore, you can more or less achieve the same thing via an external Groovy script:

```
cas.authn.pac4j.saml[0].saml2-attribute-converter=file:/path/to/AttributeConverter.groovy
```

...and the script would be tasked to run your conversion rules and produce attributes:

```groovy
import org.pac4j.saml.credentials.*
import org.opensaml.core.xml.*
import org.opensaml.saml.saml2.core.*

def run(Object[] args) {
    def attribute = args[0]
    def logger = args[1]
    
    logger.info("Converting attribute ${attribute}")
    def samlAttribute = new SAML2AuthenticationCredentials.SAMLAttribute()
    /*
        Stuff happens...
    */
    return samlAttribute
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[pac4j]: https://github.com/pac4j/pac4j
[delegation]: https://apereo.github.io/cas/development/integration/Delegate-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html