---
layout:     post
title:      Shibboleth Identity Provider - Scripted Attribute Definitions
summary:    Review configuration options available in the Shibboleth Identity Provider that allows one to build custom scripted attribute definitions programmatically.
tags:       ["Shibboleth Identity Provider"]
---

The Shibboleth Identity provider presents a facility to define custom attributes via `AttributeDefintion` entries. These definitions present a neutral representation of (typically person) data and eventually become SAML Attributes, OIDC claims, or other protocol-specific representations. Scripted attribute definitions exist to allow one to output an attribute via the execution of a script.

{% include googlead1.html %}

In this post, we will briefly look at options that allow one to construct custom-scripted attribute definitions in the Shibboleth Identity Provider. Our starting position is as follows:

- Shibboleth Identity Provider `4.3.x`
- Java `11`

# Use Case

Scripted attribute definitions construct an output attribute via the execution of a JSR-223 script. JSR-223 defines a scripting framework for the Java platform and allows a Java application such as the Shibboleth Identity provider to embed and evaluate scripts. Such scripts are typically easier to write and maintain than native Java code and they may also change and reload dynamically.
{% include googlead1.html %}
Let's start with a concrete use case: we would want to define a custom attribute called `fancyDisplayName` whose value is derived from `lastname` and `firstname` attributes that are presented to the IdP via an Active Directory LDAP connector. To make matters more interesting, we also would want to use the `label` attribute instead of `firstname` only when it's available; otherwise, we would default to the `firstname`.

# Solution

We can start by defining an attribute definition with the type `ScriptedAttribute` and assign it the identifier for `fancyDisplayName`. Then, we need to establish a connection to the LDAP data connector, defined under the id `myLDAP`, and allow the scripted attribute definition to receive are input attributes, which are `label`, `firstname` and `lastname`. Of course, you want to make sure the actual `myLDAP` LDAP data connector can retrieve and return these attributes in the first place.
{% include googlead1.html %}
Once the basic construct is in place, we can proceed to implement the required use case through a series of `if` conditions that check for appropriate attributes and build the final attribute definition.

```xml
<AttributeDefinition xsi:type="ScriptedAttribute" id="fancyDisplayName" >
      <InputDataConnector ref="myLDAP" attributeNames="label firstname lastname" />
      <AttributeEncoder xsi:type="SAML2String" 
            name="urn:oid:2.16.840.1.113730.3.1.241" 
            friendlyName="displayName" encodeType="false" />
      <Script>
      <![CDATA[

      logger = Java.type("org.slf4j.LoggerFactory")
            .getLogger("net.shibboleth.idp.attribute.resolver.Script.fancyDisplayName");
      
      var lastnameValue = '';
      var firstnameValue = '';
      var finalDisplayName = '';

      if (lastname.getValues().size() > 0) {
            lastnameValue = lastname.getValues().get(0).toString();
      }

      if (firstname.getValues().size() > 0) {
            firstnameValue = firstname.getValues().get(0).toString();
      }

      if (label.getValues().size() > 0) {
            var labelValue = label.getValues().get(0).toString();
            finalDisplayName = lastnameValue + ', ' + labelValue;
      } else {
            finalDisplayName = lastnameValue + ', ' + firstnameValue;
      }

      fancyDisplayName.addValue(finalDisplayName);
      logger.debug("Final value for fancy display name {}", fancyDisplayName.getValues());
      ]]>
      </Script>
</AttributeDefinition>
```

When and if the script executes successfully, with the assumption that `fancyDisplayName` is authorized for release, a final SAML2 response to a service provider might look like the following:
{% include googlead1.html %}
```xml
<samlp:Response>
  <saml:Assertion>
    <saml:AttributeStatement>
      <saml:Attribute Name="urn:oid:2.16.840.1.113730.3.1.241" FriendlyName="displayName"
            NameFormat="urn:oasis:names:tc:SAML:2.0:attrname-format:basic">
        <saml:AttributeValue xsi:type="xs:string">...</saml:AttributeValue>
      </saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>
```

Note that the result in the SAML2 response refers to an attribute that matches the `displayName` attribute specification. This is because the custom-scripted attribute definition is ultimately encoded as such:
{% include googlead1.html %}
```xml
<AttributeEncoder xsi:type="SAML2String" 
      name="urn:oid:2.16.840.1.113730.3.1.241" 
      friendlyName="displayName" encodeType="false" />
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to engage and contribute as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
