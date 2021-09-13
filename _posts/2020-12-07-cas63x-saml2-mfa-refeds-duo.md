---
layout:     post
title:      Apereo CAS - REFEDS MFA Profile w/ Duo Security
summary:    Learn how to use Duo Security for multifactor authentication with Apereo CAS to handle the REFEDS MFA Profile.
tags:       [CAS]
---

Apereo CAS can integrate with [Duo Security](https://www.duo.com/) to provide a smooth and seamless multifactor authentication scenario. In scenarios where CAS is also acting as a SAML2 identity provider, there may be a requirement to support the [REFEDS MFA Profile](https://refeds.org/profile/mfa) and enforce Duo Security multifactor authentication on service providers that require the REFEDS authentication context class. 

{% include googlead1.html  %}

This use case is the exact focus of this post which is based on:

- CAS `6.3.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## CAS Configuration

The CAS overlay must include the [appropriate module](https://apereo.github.io/cas/6.3.x/mfa/DuoSecurity-Authentication.html) for Duo Security in the build, and integration settings must be obtained from the Duo admin console and be provided as CAS properties:

```
cas.authn.mfa.duo[0].duo-secret-key=...
cas.authn.mfa.duo[0].duo-application-key=...
cas.authn.mfa.duo[0].duo-integration-key=...
cas.authn.mfa.duo[0].duo-api-host=..
```

The *WebSDK* variant for Duo Security allows CAS to host the Duo Security authentication prompt inside an embedded `iFrame`. This approach requires the `duo-application-key`, which is at least 40 characters long and is a setting you must generate and keep secret. You can generate a random string in Python with:

```python
import os, hashlib
print hashlib.sha1(os.urandom(32)).hexdigest()
```

{% include googlead1.html  %}

Of course, you should also make sure that CAS can [act as a SAML2 identity provider](https://apereo.github.io/cas/6.3.x/installation/Configuring-SAML2-Authentication.html). If you look around the blog, you will find a good number of posts that discuss this topic and its many variants, some of which are listed below:

- [Apereo CAS - SAML2 Metadata Query Protocol](/2019/04/12/cas61x-saml-idp-mdq/)
- [Apereo CAS - SAML2 Identity Provider Integration w/ InCommon](/2019/01/18/cas61-saml2-idp-incommon/)
- [Apereo CAS - SAML2 Metadata Overrides](/2019/12/16/cas62x-saml2-metadata-service/)

## REFEDS MFA Profile

So then comes the REFEDS MFA Profile:

> This Multi-Factor Authentication (MFA) Profile specifies requirements that an authentication event must meet to communicate the usage of MFA. It also defines a SAML authentication context for expressing this…

...and:

> The MFA Authentication Context can be used by Service Providers to request that Identity Providers perform MFA as defined below and by IdPs to notify SPs that MFA was used.

In more complicated terms, if a SAML SP were to specify `https://refeds.org/profile/mfa` as the required authentication context, the identity provider would need to translate and find the appropriate MFA solution to execute to satisfy that requirement and then reassuringly convey the result back to the SP.

The required authentication class can be requested in the SAML2 authentication request that is sent by the service provider:

```xml
<saml2p:AuthnRequest>
    ...
    <saml2p:RequestedAuthnContext Comparison="exact">
        <saml2:AuthnContextClassRef xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">
          https://refeds.org/profile/mfa
        </saml2:AuthnContextClassRef>
    </saml2p:RequestedAuthnContext>
</saml2p:AuthnRequest>
```

## Authentication Context Class

To handle the above requirement, we need to adjust the CAS configuration to link the REFEDS MFA profile to Duo Security. This mapping can be done via CAS settings:

```
cas.authn.saml-idp.authentication-context-class-mappings[0]=https://refeds.org/profile/mfa->mfa-duo
```

{% include googlead1.html  %}

The above setting indicates to CAS that authentication requests that carry the REFEDS MFA profile should be put through multifactor authentication with Duo Security. At the end of this authentication flow, the service provider should be able to examine the SAML2 response for the correct `AuthnContextClassRef` value:

```xml
<saml2p:Response>
    ...
    <saml2:Assertion>
        ...
        <saml2:AuthnStatement>
            <saml2:AuthnContext>
                <saml2:AuthnContextClassRef>
                    https://refeds.org/profile/mfa
                </saml2:AuthnContextClassRef>
            </saml2:AuthnContext>
        </saml2:AuthnStatement>
        ...
    </saml2:Assertion>
</saml2p:Response>
```


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
