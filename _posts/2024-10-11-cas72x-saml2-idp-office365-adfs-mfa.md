---
layout:     post
title:      Apereo CAS - Microsoft Office365 & Multifactor Authentication
summary:    Learn how to inform Microsoft Office365 and/or ADFS that multifactor authentication is successfully carried out by CAS via the likes of Duo Security, using a SAML2 integration.
tags:       ["CAS 7.2.x", "SAML2", "MFA"]
---

If your Apereo CAS deployment supports Microsoft Office365 (perhaps via a SAML2 integration), you might have seen the following announcement from Microsoft:

> Action required: Enable multifactor authentication for your tenant by...
> You’re receiving this email because you’re a global administrator for ...
> We will require users to use multifactor authentication (MFA) to sign into the Azure portal, Microsoft Entra admin center, and Intune admin center. To ensure your users maintain access, you’ll need to enable MFA by ...
{% include googlead1.html  %}
Your CAS deployment might already handle multifactor authentication via a provider such as Duo Security. The task at hand is then to inform Office365 that MFA is successfully carried out by slightly augmenting the SAML2 response to include a now-required attribute `http://schemas.microsoft.com/claims/authnmethodsreferences` with the right value.

{% include googlead1.html  %}

Let's begin. Our starting position is based on:

- CAS `7.2.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)


# Microsoft Office365

The following tasks need to be carried out:

You must let Entra/Office365 know that your federation supports MFA. This can be done in Powershell via:
{% include googlead1.html  %}
```powershell
Set-MsolDomainFederationSettings -DomainName school.edu -SupportsMfa $true
```

Then, you need to configure ADFS to pass `Authentication Methods Reference` on the CAS Claims Provider and the Office365 relay:
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/office365.png" width="80%" title="Apereo CAS - Microsoft Office365 & Multifactor Authentication" %}

...and configure the relying party appropriately:
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/office365-2.png" width="80%" title="Apereo CAS - Microsoft Office365 & Multifactor Authentication" %}

# CAS

Since the integration is carried out via SAML2, you will need to make sure your deployment is prepped to allow CAS to act as a SAML2 identity provider. Once you're there, the application registration record will look like the following:
{% include googlead1.html  %}
```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "http://fs.domain.edu/adfs/services/trust",
  "name": "ADFS",
  "id": 1,
  "description": "Microsoft",
  "attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ReturnMappedAttributeReleasePolicy",
    "allowedAttributes": {
      "@class": "java.util.TreeMap",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/windowsaccountname": [
        "java.util.ArrayList",
        [
          "groovy { return 'DOMAIN\\\\' + attributes['samaccountName'][0] }"
        ]
      ],
      "upn": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn,"
    }
  },
  "multifactorPolicy": {
    "@class": "org.apereo.cas.services.DefaultRegisteredServiceMultifactorPolicy",
    "multifactorAuthenticationProviders": [
      "java.util.HashSet",
      [
        "mfa-duo"
      ]
    ],
    "bypassPrincipalAttributeName": "memberOf",
    "bypassPrincipalAttributeValue": "^CN=MFA-Exempt.*",
  },
  "metadataLocation": "https://fs.domain.edu/federationmetadata/2007-06/federationmetadata.xml",
  "signAssertions": true,
  "signResponses": false,
  "skipGeneratingAssertionNameId": false,
  "skipGeneratingSubjectConfirmationInResponseTo": false,
  "skipGeneratingSubjectConfirmationNotOnOrAfter": false,
  "skipGeneratingSubjectConfirmationRecipient": false,
  "skipGeneratingSubjectConfirmationNotBefore": true,
}
```

The above application registration record is the basic template you need to enable the integration between CAS and Microsoft. Now, to communicate that MFA has succesfully been carried out, we need to modify the attribute release policy to release an attribute called `http://schemas.microsoft.com/claims/authnmethodsreferences` with the value `http://schemas.microsoft.com/claims/multipleauthn`. So you might want to consider adding the following entry to the release policy:
{% include googlead1.html  %}
```
"http://schemas.microsoft.com/claims/authnmethodsreferences": 
    '''
    groovy { 
        return ['http://schemas.microsoft.com/claims/multipleauthn'] 
    }
    '''
```

This works, but the danger here is that this attribute is released regardless and all the time. The rule here says nothing about how this attribute should be released conditionally and only when MFA has been completed, and for that, we need a slightly different version:
{% include googlead1.html  %}
```
"http://schemas.microsoft.com/claims/authnmethodsreferences": 
    '''
    groovy {
        // logger.info("Processing attributes {}", attributes)
        if (attributes.containsKey("duoSub")) {
            return ['http://schemas.microsoft.com/claims/multipleauthn']
        }
        return []
    }
    '''
```

The `duoSub` attribute is collected by CAS when Duo Security (our multifactor provider of choice here) has successfully completed. Thus, we can conditionally release the `http://schemas.microsoft.com/claims/authnmethodsreferences` attribute only when the MFA is successful and judge that based on the presence of `duoSub` attribute.

# Alternatives

CAS internally tracks the satisfied authentication context class using an attribute that is typically called `authnContextClass`. Its value indicates the identifier of the multifactor authentication provider that has fulfilled the multifactor requirements and one that has successfully carried out the flow.

<div class="alert alert-info">
<strong>Note</strong><br/>This option only works if you are on the most recent version of the CAS software.
</div>

We can set up an [attribute definition](https://apereo.github.io/cas/development/integration/Attribute-Definitions.html) to rename this attribute to our chosen attribute:
{% include googlead1.html  %}
```json
"authnContextClass": {
    "@class": "org.apereo.cas.support.saml.web.idp.profile.builders.attr.SamlIdPAttributeDefinition",
    "key": "authnContextClass",
    "name": "http://schemas.microsoft.com/claims/authnmethodsreferences"
}
```

Then, we need to teach CAS that the satisfied authentication context that might be `mfa-duo` as the value of the attribute should be translated to something else:
{% include googlead1.html  %}
```properties
cas.authn.saml-idp.core.context.authentication-context-class-mappings= \
    http://schemas.microsoft.com/claims/multipleauthn->mfa-duo
```

The end result in either scenario should match the following:

```xml
<saml2:Attribute FriendlyName="http://schemas.microsoft.com/claims/authnmethodsreferences" 
                 Name="http://schemas.microsoft.com/claims/authnmethodsreferences" 
                 NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
    <saml2:AttributeValue>
        http://schemas.microsoft.com/claims/multipleauthn
    </saml2:AttributeValue>
</saml2:Attribute>
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
