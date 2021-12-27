---
layout:     post
title:      Apereo CAS - SAML2 NameID Variations
summary:    An overview of techniques and strategies used to produce NameID elements in SAML2 responses of Apereo CAS acting as a SAML2 identity provider, whether as part of the Subject tag or embedded inside individual SAML2 attributes.
tags:       ["CAS 6.4.x", "SAML"]
---

When managing and deploying Apereo CAS as a SAML2 identity provider, it's rather common for SAML2 service provider integrations and applications to expect a specific `NameID` from the SAML2 response they receive from CAS. A SAML2 `NameID` is an element that generally belongs to the `Subject` tag, is assigned a specific format and 
usually takes on the following form in the SAML2 response:

```xml
<saml:Subject>
    <saml:NameID SPNameQualifier="http://sp.example.com/demo1/metadata.php" 
                 Format="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">
        123456abcdefg
    </saml:NameID>
</saml:Subject>
```

{% include googlead1.html  %}

In this post, we'll take a look at a few variations of the `NameID` element in the SAML2 response, and ways to accommodate integration requirements that expect a specific `NameID` format or value from CAS as a SAML2 identity provider.

This tutorial specifically requires and focuses on:

- CAS `6.4.x`
- Java 11


## Attribute-based NameIDs

By default, the `NameID` value is determined as the identifier of the authenticated CAS principal. Once the authentication task is complete and the principal is resolved from all sources, the principal identifier is extracted as the `NameID` value. 

This default behavior can be customized on a per-application degree to use a specific attribute as the basis for the `NameID` value. For example, if the authenticated principal identified as `casuser` carries a `mail` attribute, the following snippet could be used to produce a `nameid-format:emailAddress` type of `NameID` based on that attribute value:

{% include googlead1.html  %}

```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "https://spring.io/security/saml-sp",
  "name": "SAML",
  "metadataLocation": "/path/to/sp-metadata.xml",
  "requiredNameIdFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  "usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.PrincipalAttributeRegisteredServiceUsernameProvider",
    "usernameAttribute" : "mail",
  }
}
```

...which should produce the following:

```xml
<saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
        user@example.org</saml:NameID>
</saml:Subject>
```

## Persistent NameIDs

The same technique can be used to produce a `` type of `NameID`, using the following snippet:

```json
{
    "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
    "serviceId": "https://spring.io/security/saml-sp",
    "name": "SAML",
    "metadataLocation": "/path/to/sp-metadata.xml",
    "requiredNameIdFormat": "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
    "usernameAttributeProvider": {
    "@class": "org.apereo.cas.services.AnonymousRegisteredServiceUsernameAttributeProvider",
    "persistentIdGenerator": {
        "@class": "org.apereo.cas.authentication.principal.ShibbolethCompatiblePersistentIdGenerator",
        "salt": "salty-goodness",
        "attribute": "cn"
    }
  }
}
```

{% include googlead1.html  %}

...which should produce the following:

```xml
<saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">
        Qe76hjfM14GBAqeW124</saml:NameID>
</saml:Subject>
```

## Inline NameID Attributes

Once you have produced a `NameID` for the SAML2 `Subject`, you may also have to create and release a specific attribute that contains an *embedded* `NameID` as its value. Specifically, this would take on the following form:

```xml
<saml2:Attribute FriendlyName="my-attribute" 
                 Name="my-attribute"
                 NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
    <saml2:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"
                  NameQualifier="https://idp.example.org/cas/idp"
                  SPNameQualifier="https://idp.example.org/sp">
        lkXqG+QpbLU47hvjVvfiADxEQs0=
    </saml2:NameID>
</saml2:Attribute>
```

{% include googlead1.html  %}

The `NameID` attribute value, in this case, is identical to that of the `Subject`; the same element in a sense is *copied* and reused to create the above attribute. This can be achieved by tagging the attribute value type as such:

```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "https://spring.io/security/saml-sp",
  "name": "SAML",
  "metadataLocation": "/path/to/sp-metadata.xml",
  "attributeValueTypes": {
    "@class": "java.util.HashMap",
    "my-attribute": "NameIDType"
  }
}
```

## eduPersonTargetedID NameIDs

The `eduPersonTargetedID` attribute is an abstracted version of the SAML V2.0 Name Identifier format 
of `urn:oasis:names:tc:SAML:2.0:nameid-format:persistent`. In abstract terms, an `eduPersonTargetedID` value is a 
tuple consisting of an opaque identifier for the principal, a name for the source of the identifier, and a name for the intended audience of the identifier. 

{% include googlead1.html  %}

CAS provides a specific attribute release policy that can generate an `eduPersonTargetedID` attribute. Once in place, you may also tag this attribute to specifically be used as an *embedded* `NameID` inside the attribute definition in the SAML2 response: 

```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId": "https://spring.io/security/saml-sp",
  "name": "SAML",
  "metadataLocation": "/path/to/sp-metadata.xml",
  "attributeValueTypes": {
    "@class": "java.util.HashMap",
    "urn:oid:1.3.6.1.4.1.5923.1.1.1.10": "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent",
  },
  "attributeReleasePolicy": {
    "@class": "org.apereo.cas.services.ChainingAttributeReleasePolicy",
    "policies": [
      "java.util.ArrayList",
      [
        {
          "@class": "org.apereo.cas.support.saml.services.EduPersonTargetedIdAttributeReleasePolicy",
          "order": 1,
          "salt": "salty-goodness",
          "attribute": "cn",
          "useUniformResourceName": true
        }
      ]
    ]
  }
}
```

The above configuration will create the `eduPersonTargetedID` attribute under the name `urn:oid:1.3.6.1.4.1.5923.1.1.1.10`, as instructed via the `useUniformResourceName`. The attribute value is based on the `cn` attribute that is already resolved for the principal from attribute sources. Once constructed, this attribute value will be transformed and encoded as a `nameid-format:persistent` type of `NameID`, which would be something like this:

{% include googlead1.html  %}

```xml
<saml2:Attribute FriendlyName="eduPersonTargetedID" 
                 Name="urn:oid:1.3.6.1.4.1.5923.1.1.1.10"
                 NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:uri">
    <saml2:NameID Format="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"
                  NameQualifier="https://idp.example.org/cas/idp"
                  SPNameQualifier="https://idp.example.org/sp">
        lkXqG+QpbLU47hvjVvfiADxEQs0=
    </saml2:NameID>
</saml2:Attribute>
```


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html