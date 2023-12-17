---
layout:     post
title:      Apereo CAS - SAML2 Protocol & Identity Provider
summary:    Learn how to configure Apereo CAS to act as a SAML 2.0 identity provider.
tags:       ["CAS 7.0.x", "Authentication", "SAML", "SAML2"]
---

The SAML2 protocol is often seen as a cornerstone for achieving enterprise-level secure Single Sign-On experiences. SAML, or Security Assertion Markup Language, is a robust protocol that facilitates the exchange of authentication and authorization data between relying parties and applications most commonly on the web in a standardized, XML-based format. In this post, we will take a look at what it takes to turn on SAML2 support in Apereo CAS and allow it to act as a SAML2 identity provider. 

{% include googlead1.html  %}

This tutorial specifically focuses on:

- CAS `7.0.x`
- Java `21`

# Setup

The typical setup is quite simple once you include the [relevant extension module](https://apereo.github.io/cas/development/authentication/Configuring-SAML2-Authentication.html) in your build. Then, at the very minimum you'll need to include the following settings:
{% include googlead1.html  %}
```properties
cas.authn.saml-idp.core.entity-id=https://cas.apereo.org/saml/idp
cas.authn.saml-idp.metadata.file-system.location=file:/path/to/saml-idp/metadata

cas.server.name=https://cas.apereo.org
cas.server.prefix=${cas.server.name}/cas
cas.server.scope=apereo.org
```

On startup, CAS will choose to auto-generate identity provider metadata at the specified path and it will only do so if metadata artifacts cannot be found or do not exist at the specified location. If they are found, they are reused and loaded by the running instance. This means that you will have to be very careful in managing, securing and keeping such artifacts in place, or else you run the risk of breaking every SAML2 integration that is registered with CAS.
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Note</strong><br/>If you are deploying CAS in a cluster in an HA setup, you <strong>MUST</strong> make sure all CAS nodes in the cluster have access to the same metadata artifacts and files. Typically, one can generate such files on one node and then copy them over to others. Any metadata discrepancy between CAS nodes will lead to suspicious failures and quite often very expensive troubleshooting sessions.
</div>

# Service Provider Registrations

Once you have a functioning build, you can begin registering your SAML2 service providers and client applications with CAS whose registration record may likely be managed in [flat JSON files](https://apereo.github.io/cas/development/services/JSON-Service-Management.html):
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "^https://app.example.org/simplesaml.+",
  "name" : "Sample",
  "id" : 1,
  "metadataLocation" : "https://app.example.org/simplesaml/metadata",
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllAttributeReleasePolicy"
  }
}
```

There are a few things to unpack here:

1. The `serviceId` field here should represent the entity id of the SAML2 service provider in the form of a proper regular expression, allowing you to authorize and register multiple SAML2 service providers in metadata, if necessary. Remember to escape all the right characters when you build the expression pattern.
2. The `metadataLocation` field represents the location of service metadata defined from system files, classpath, directories or URL resources.
{% include googlead1.html  %}
Apereo CAS, acting as a SAML2 identity provider, also can integrate with SAML2 service providers from metadata aggregates such as InCommon. To handle these types of integrations successfully, one must note that CAS services (aka relying parties) are fundamentally recognized by service identifiers taught to CAS typically via regular expressions using the `serviceId` field. This allows for common groupings of applications and services by URL patterns (i.e. *Everything that belongs to example.org is registered with CAS*). 
{% include googlead1.html  %}
A bilateral SAML2 SP integration is fairly simple in this regard as one might find an easy one-to-one relationship between a `serviceId` from CAS and the entity ID from a SAML2 service provider, such as the one you see above. With aggregated metadata, this behavior becomes more complicated since a CAS relying-party definition typically represents a single group of applications while aggregated metadata, given its very nature, represents many different SAML2 services from a variety of organizations and domains.

Here is an example that allows CAS to accept every single entity that may be found by InCommon's MDQ server:
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : ".+",
  "name" : "MDQ",
  "id" : 1,
  "metadataLocation" : "https://mdq.server.org/entities/{0}"
}
```

# Controlling NameIDs

The `NameID` serves as a unique identifier for the principal (the entity being authenticated) within the scope of the identity provider. The NameID element contains a value that uniquely identifies the user, and it is typically associated with attributes such as the user's username or email address.

The format of the `NameID` can vary. It might be an identifier in the form of an opaque string, a persistent identifier that remains constant across sessions, or a transient identifier that changes with each authentication. The specific format is determined by the agreement between the identity provider and the service provider.

In CAS, a variety of rules and conditions are evaluated to control the final format of the `NameID` and its value. One strategy is to put an override directly into the application policy: 
{% include googlead1.html  %}
```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "...",
  "requiredNameIdFormat": "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
  "usernameAttributeProvider" : {
    "@class" : "org.apereo.cas.services.PrincipalAttributeRegisteredServiceUsernameProvider",
    "usernameAttribute" : "mail"
  }
}
```

This instructs CAS to build the `NameID` value off of the attribute `mail`, which of course must already be available to CAS when the rules are evaluated here.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
