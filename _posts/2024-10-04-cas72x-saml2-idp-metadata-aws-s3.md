---
layout:     post
title:      Apereo CAS - Manage SAML2 Identity Provider Metadata via AWS S3 Buckets
summary:    Learn how to store SAML2 identity provider metadata in AWS S3 buckets
tags:       ["CAS 7.2.x", "SAML"]
---

Amazon provides a Simple Storage Service, known as S3 that allows one to store data such as files, images, etc as objects in what is called *buckets*. Each S3 bucket is a data container for objects, where each object consists of a file and its *metadata* (i.e. extra properties that describe the object in key-value form).

CAS SAML2 metadata artifacts such as the actual XML metadata, signing and/or encryption keys may be stored in and fetched from Amazon S3 buckets. This may specially be used to avoid copying metadata files across CAS nodes in a cluster, particularly where one needs to deal with more than a few bilateral SAML integrations. 

{% include googlead1.html  %}

Let's begin. Our starting position is based on:

- CAS `7.2.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

Metadata documents are stored in and fetched from a single pre-defined bucket that is taught to CAS. This bucket is automatically created by CAS if it does not exist, and is only ever expected hold a single object. The object only holds the actual XML metadata, and keys and certificates are tracked as *metadata* attached to the object. CAS would only generate the SAML2 identity provider metadata if it cannot be found or if it's seen as invalid or compromised.
{% include googlead1.html  %}
The setup is relatively simple. Once your build includes the appropriate [extension module](https://apereo.github.io/cas/7.2.x/installation/Configuring-SAML2-DynamicMetadata-AmazonS3.html), you will need to instruct CAS to connect to AWS and define bucket-related settings:
{% include googlead1.html  %}
```properties
cas.authn.saml-idp.metadata.amazon-s3.idp-metadata-bucket-name=thebucket
cas.authn.saml-idp.metadata.amazon-s3.region=us-east-1
```

The S3 bucket does of course track private key material such as the signing or encryption key. These artifacts can be encrypted by CAS before they are submitted, and are decrypted when read back. You'll need to activate the relevant *cipher* for security operations to kick in:
{% include googlead1.html  %}
```properties
cas.authn.saml-idp.metadata.amazon-s3.crypto.enabled=true

cas.authn.saml-idp.metadata.amazon-s3.crypto.encryption.key=
cas.authn.saml-idp.metadata.amazon-s3.crypto.signing.key=
```
{% include googlead1.html  %}
The default algorithm used here is `A128CBC-HS512`. Remember that keys will be automtically generated for you on startup, or you can generate them yourself using [CAS command-line shell](https://apereo.github.io/cas/7.2.x/installation/Configuring-Commandline-Shell.html).

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
