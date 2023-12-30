---
layout:     post
title:      Apereo CAS - Multifactor Authentication w/ WebAuthn FIDO2
summary:    Learn how to configure Apereo CAS to support WebAuthn FIDO2 for multifactor and passwordless authentication scenarios.
tags:       ["CAS 7.0.x", "MFA"]
---

WebAuthn/FIDO2 is a set of open standards developed by the FIDO (Fast Identity Online) Alliance, a consortium of leading technology companies aiming to eliminate password-based authentication and strengthen online security. This technology offers a standardized framework for secure and convenient authentication on the web, enabling users to log in to websites and applications using stronger methods, such as biometrics and hardware tokens, instead of traditional passwords. WebAuthn/FIDO2 is supported by major web browsers, platforms, and devices, making it a universal authentication standard. This interoperability ensures that users can enjoy the benefits of passwordless authentication across various online services, irrespective of the device or operating system they use.

{% include googlead1.html %}

WebAuthn support in Apereo CAS comes in two flavors: one that can act as a multifactor authentication provider in combination and in addition to the typical primary authentication flow, and one that can itself act as the primary mode of authentication for a passwordless experience. In this blog post, we will briefly review the configuration required to turn on WebAuthnin Apereo CAS and walk through the usual configuration options and nuances.

Our starting position is as follows:

- CAS `7.0.x`
- Java `21`

# Configuration

Once you have the [right module](https://apereo.github.io/cas/7.0.x/mfa/FIDO2-WebAuthn-Authentication.html) in place, your starting set of configuration options should be as follows:

```properties
cas.authn.mfa.web-authn.core.application-id=https://sso.example.org
cas.authn.mfa.web-authn.core.allowed-origins=https://sso.example.org
cas.authn.mfa.web-authn.core.relying-party-name=CAS WebAuthn
cas.authn.mfa.web-authn.core.relying-party-id=sso.example.org
```
{% include googlead1.html  %}
Devices and browsers need to be registered with CAS before they can present credentials and authenticate. The registration flow is baked into CAS automatically, and for the most part, you should just decide how and where the device registration records should be stored and managed. One option is to use a simple JSON file:

```properties
cas.authn.mfa.web-authn.json.location=file:/path/to/webauthn-devices.json
```

That should be sufficient. Next, when you navigate to `https://sso.example.org/cas/login?authn_method=mfa-webauthn`, you should be asked to register your browser/device after the initial primary authentication step. 

# Attestation Trust

To manage device attestation trust, CAS by default ships with a set of trust metadata offered by Yubico, for a series of devices that are also primarily offered by Yubico. You could of course load your trust metadata as a JSON file via the following setting:

```properties
cas.authn.mfa.web-authn.core.trust-source.trusted-device-metadata.location=file:/path/to/attestation.json
```
{% include googlead1.html  %}
Or you might feel lucky and want to disable attestation trust altogether:

```properties
cas.authn.mfa.web-authn.core.allow-untrusted-attestation=true
```

Recent versions of CAS also support downloading attestation trust metadata blogs from the FIDO website. For this to activate, you need to accept the terms and conditions of FIDO service via:
{% include googlead1.html  %}
```properties
# Optionally, specify the URL...
# cas.authn.mfa.web-authn.core.trust-source.fido.metadata-blob-url=https://mds.fidoalliance.org/

cas.authn.mfa.web-authn.core.trust-source.fido.legal-header= \
    Retrieval and use of this BLOB indicates acceptance of the appropriate \
    agreement located at https://fidoalliance.org/metadata/metadata-legal-terms/
```

# Passwordless Authentication

So far, the WebAuthn/FIDO2 flow is a secondary flow after the initial primary authentication step. For a better passwordless experience, you may allow users to directly authenticate with their FIDO2-enabled device via the following option:

```properties
cas.authn.mfa.web-authn.core.allow-primary-authentication=true
```

This would allow CAS to present the WebAuthn/FIDO2 flow as the primary of authentication:
{% include googlead1.html  %}
{% include image.html img="https://github.com/mmoayyed/mmoayyed.github.io/assets/1205228/660e9143-1db1-47f8-8c47-7acb9256d3cc" width="70%" 
title="Apereo CAS - Multifactor Authentication w/ WebAuthn FIDO2" %}

Note that this option only works if there is a registration entry for the device found already, which means you'd have to register devices out of band. 

Remember that WebAuthn/FIDO2 is now used as the first and primary authentication strategy. Once the flow has been completed successfully, you may need to still allow CAS to fetch attributes for the authenticated user from various attribute sources. To handle this, you will need to define attribute repositories, for example, to connect to an LDAP server and fetch attributes such as `displayName`:
{% include googlead1.html  %}
```
cas.authn.attribute-repository.ldap[0].ldap-url=ldaps://ldap.example.edu
cas.authn.attribute-repository.ldap[0].base-dn=dc=test,dc=example,dc=edu
cas.authn.attribute-repository.ldap[0].search-filter=sAMAccountName={user}
cas.authn.attribute-repository.ldap[0].subtree-search=true
cas.authn.attribute-repository.ldap[0].bind-dn=cas@ldap.example.edu
cas.authn.attribute-repository.ldap[0].bind-credential=...
cas.authn.attribute-repository.ldap[0].attributes.displayName=displayName
```

...and to complete the flow, use the following setting to instruct CAS to fetch attributes for the authenticated CAS principal/subject, and disregard the credential identifier for principal/person resolution:
{% include googlead1.html  %}
```properties
cas.person-directory.use-existing-principal-id=true
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html