---
layout:     post
title:      Apereo CAS - SAML2 Metadata Caching
summary:    Review modest strategies to register SAML2 service providers in Apereo CAS, and manage metadata caching techniques globally and/or for each service provider.
tags:       [CAS]
---

Apereo CAS can be configured to act as a standalone [SAML2 identity provider](https://apereo.github.io/cas/development/authentication/Configuring-SAML2-Authentication.html) to integrate with and support SAML2 service providers via appropriate SAML2 metadata exchanges to establish mutual trust. Such exchanges can be configured and managed using a variety of ways, the most common of which happens to via the file system or URL. In this post, we will take a look at both options to discuss modest approaches to metadata management as well as caching behavior and controls. 

{% include googlead1.html  %}

This post specifically requires and focuses on:

- CAS `6.4.x`
- Java `11`
- [JSON Service Registry](https://apereo.github.io/cas/development/services/JSON-Service-Management.html)

# SAML2 Service Providers

In the most basic form, SAML relying parties and services can be registered with the CAS service registry similar to the following example:

```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "the-entity-id-of-the-sp",
  "name" : "SAML2-Service-Provider",
  "id" : 1,
  "metadataLocation" : "file:/path/to/metadata.xml"
}
```

The service provider metadata in the above example is directly shared with CAS as a physical file via the file system. You also have the option to use a dedicated URL to fetch and download service provider metadata if one is available and provided to you:

{% include googlead1.html  %}

```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "the-entity-id-of-the-sp",
  "name" : "SAML2-Service-Provider",
  "id" : 1,
  "metadataLocation" : "https://sp.example.org/saml2/metadata"
}
```

The `metadataLocation` field can flexibly point to the location of service provider metadata defined from system files, classpath, or URL resources.

<div class="alert alert-info">
  <strong>Metadata Query Protocol</strong><br/>Apereo CAS also supports the 
  <a href="/2019-04-12-cas61x-saml-idp-mdq.md">Metadata Query Protocol</a> such as the one
  provided by <a href="https://spaces.at.internet2.edu/display/federation/Metadata+Service">InCommon Metadata Service</a>.
</div>

# SAML2 Metadata Trust Model

SAML2 metadata should generally be signed for integrity and authenticity, especially if it's provided and shared with participants using a URL. Participants are **strongly** encouraged to verify the XML signature on the metadata file before use; failure to do so will seriously compromise the security of the SAML deployment. 

An important point to emphasize here is:

{% include googlead1.html  %}

> A trusted metadata process MUST verify the XML signature of the metadata. It is not sufficient to request the metadata via a TLS-protected HTTP connection.

In fact and to emphasize this point, many service providers choose to publish their metadata behind an `http` URL to remove all illusions of security via TLS. Thankfully, it is fairly straight-forward to enable signature validation of the metadata via the same registration entry:

```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "the-entity-id-of-the-sp",
  "name" : "SAML2-Service-Provider",
  "id" : 1,
  "metadataLocation" : "https://sp.example.org/saml2/metadata",
  "metadataSignatureLocation": "file:/path/to/signing-certificate.crt"
}
```

The `metadataSignatureLocation` defines the location of the metadata signing certificate/public key to validate the metadata which must be defined from system files or classpath. If defined, CAS will enforce the `SignatureValidationFilter` validation filter on metadata.

{% include googlead1.html  %}

<div class="alert alert-warning">
  <strong>Expiration Date Validation</strong><br/>Verifying the signature on a SAML metadata file does not validate 
  the presence or value of an expiration date. The only way to validate the expiration date is to parse the XML.
</div>

# SAML2 Metadata Refresh

Once metadata is downloaded and resolved, it is housed in a cache store with a controllable expiration date. The intention is that subsequent attempts to resolve metadata for a service provider should not have to parse or download the XML content again and instead, the cached and already-resolved copy of the metadata should be used until it's invalidated and expired. Typically, the expiration and caching options can be specified in the metadata itself:

```xml
<?xml version="1.0" ?>
<md:EntityDescriptor entityID="urn:app.example.net"
  cacheDuration="PT604800S"  validUntil="2021-02-17T22:17:52Z"
  xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata">
...
```

In the above example, the resolved metadata should be cached for approximately 7 days and shall remain valid until the indicated validity date. If the metadata does not require or suggest a validity date or cache expiration period, you can of course tweak the cache timeout on the service provider registration entry directly:

{% include googlead1.html  %}

```json
{
  "@class" : "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "serviceId" : "the-entity-id-of-the-sp",
  "name" : "SAML2-Service-Provider",
  "id" : 1,
  "metadataLocation" : "https://sp.example.org/saml2/metadata",
  "metadataExpirationDuration": "PT2H"
}
```

In the above example, `metadataExpirationDuration` indicates that metadata downloaded and resolved for this service provider should be cached for 2 hours. Furthermore, you could also control the cache expiration policy globally and not have to define it for every single service provider:

```properties
cas.authn.saml-idp.metadata.core.cache-expiration=PT4H
```

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html