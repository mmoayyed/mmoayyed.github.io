---
layout:     post
title:      Apereo CAS - Google Apps Integration
summary:    Learn how to use Apereo CAS as a SAML2 identity provider to integrate with Google Apps.
tags:       ["CAS 6.6.x", "SAML"]
---

Google Apps for Education (or any of the Google apps) utilizes SAML 2.0 to provide an integration point for external authentication services. While this integration was more of a one-off in previous CAS versions, it is now being deprecated in favor of a more typical SAML2 integration with Apereo CAS acting as a proper SAML2 identity provider. In this blog post, we will briefly review the configuration required to set up Apereo CAS as the authentication source for Google Apps.

{% include googlead1.html  %}

Our starting position is as follows:

- CAS `6.6.x`
- Java `11`

# Configuration

Once you have CAS configured as a [SAML2 identity provider][saml2], the next step is to register Google Apps with CAS. As of this writing, Google Apps does not provide SAML service provider metadata. This is then left as an exercise for the adopter to put together, and then configure CAS to read. This metadata could be in a `google-apps.xml` file as such:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor
    entityID="google.com/a/example.net"
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:email</md:NameIDFormat>
      <md:AssertionConsumerService
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="https://www.google.com/a/example.net/acs" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>
```
{% include googlead1.html  %}
Take special note of the `entityID` and `Location` attributes; you want to make sure `example.net` is replaced with your Google domain.

Once you have the metadata, you can begin to register Google Apps as a SAML2 service provider with CAS:

```json
{
  "@class": "org.apereo.cas.support.saml.services.SamlRegisteredService",
  "id": 1,
  "evaluationOrder": 1
  "serviceId": "google.com/a/example.net",
  "assertionAudiences": "https://www.google.com/a/example.net/acs",
  "name": "GoogleApps",
  "usernameAttributeProvider": {
    "@class": "org.apereo.cas.services.PrincipalAttributeRegisteredServiceUsernameProvider",
    "usernameAttribute": "mail",
    "canonicalizationMode": "LOWER"
  },
  "metadataLocation": "file:/path/to/google-apps.xml"
}
```
{% include googlead1.html  %}
<div class="alert alert-info">
<strong>Note</strong><br />The configuration tasks and details required to fetch the <code>mail</code> attribute from attribute repository sources configured in CAS are outside the scope of this blog post. If you look around the blog, you are likely to find many other related posts and examples.</div>

Once more, you want to make sure `example.net` is replaced with your Google domain. Furthermore, our registration entry forces CAS to use the `mail` attribute for the SAML2 `NameID` element. If you do not have this attribute available, you could use any other attribute and scope it appropriately to build a valid attribute value:
{% include googlead1.html  %}
```json
  "usernameAttributeProvider" : {
    "@class": "org.apereo.cas.services.PrincipalAttributeRegisteredServiceUsernameProvider",
    "usernameAttribute": "uid",
    "canonicalizationMode": "LOWER",
    "scope": "example.org"
  }
```
{% include googlead1.html  %}
Finally, you need to configure your Google domain to use the *Setup SSO with third party identity provider* option. Then, upload your CAS SAML2 signing certificate that typically is found under an `idp-signing.crt` file, and then configure the login and logout URLs:

- Sign-in URL: `https://sso.example.org/cas/idp/profile/SAML2/Redirect/SSO`
- Sign-out URL: `https://sso.example.org/cas/logout`

You may also need to select the *Use a domain-specific issuer* option. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[saml2]: https://apereo.github.io/cas/6.5.x/authentication/Configuring-SAML2-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
