---
layout:     post
title:      Apereo CAS - Delegated Authentication with Microsoft Azure Active Directory
summary:    Learn how to use Microsoft Azure Active Directory as an external OpenID Connect identity provider and connect it to CAS for a delegated/proxy authentication scenario.
tags:       ["CAS 7.0.x", "Delegated Authentication", "Azure Active Directory"]
---

Apereo CAS has had support to delegate authentication to [external OpenID Connect identity providers][saml2] for quite some time. This functionality, if memory serves me correctly, started around CAS 3.x as an extension based on the [pac4j project](https://github.com/pac4j/pac4j) which then later found its way into the CAS codebase as a first-class feature. Since then, the functionality more or less has evolved to allow the adopter less configuration overhead and fancier ways to automated workflows.

{% include googlead1.html %}
Of course, *delegation* is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate identity provider endpoint, and on the return trip back, CAS is tasked to shake hands, parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. In other words, in delegated scenarios, the main identity provider is an external system and CAS simply begins to act as a client or proxy in between.

{% include googlead1.html %}
In this blog post, we will start from a modest SAML2 service provider client application that is integrated with CAS and will be using [Azure Active Directory](https://azure.microsoft.com/en-us/services/active-directory/) as our external OpenID Connect identity provider to accommodate the following authentication flow:

{% include googlead1.html  %}

{% include image.html img="https://user-images.githubusercontent.com/1205228/190563434-02f6c242-5aeb-4982-be82-de4161ca0b6c.png" 
width="70%" title="CAS Login Flow" %}

- User accesses the SAML2 client application.
- User is redirected to CAS, acting as a SAML2 identity provider.
- CAS, now acting as a OIDC client itself, lets the user delegate the flow to Azure Active Directory.
{% include googlead1.html %}
- User logs in using Azure Active Directory credentials and is redirected back to CAS.
- CAS establishes an SSO session and redirects the user back to the SAML2 client application.
- SAML2 client application validates the SAML2 response from CAS and allows the user to log in.

Our starting position is as follows:

- CAS `7.0.x`
- Java `17`

## Configuration

Once you have the correct modules in the WAR overlay for [SAML2][saml2] and [Delegated Authentication][delegation], you will need to make sure CAS can hand off authentication to the Azure Active Directory identity provider:

```
cas.authn.pac4j.oidc[0].azure.tenant=...
cas.authn.pac4j.oidc[0].azure.id=...
cas.authn.pac4j.oidc[0].azure.secret=...
cas.authn.pac4j.oidc[0].azure.client-name=AzureClient
cas.authn.pac4j.oidc[0].azure.discovery-uri=https://login.microsoftonline.com/\
  <identifier>/v2.0/.well-known/openid-configuration
cas.authn.pac4j.oidc[0].azure.scope=openid,profile,email
cas.authn.pac4j.oidc[0].azure.principal-attribute-id=email
```

{% include googlead1.html  %}

The discovery URI can be found on the Azure Active Directory dashboard for your tenant:

{% include image.html img="https://user-images.githubusercontent.com/1205228/121808891-d3190300-cc6f-11eb-8b5c-8c50e40667a0.png"
width="70%" title="Azure Active Directory Discovery URI" %}

Remember that you need to register the CAS Redirect URI with Azure Active Directory. By default, the redirect (reply) URI is the
CAS login endpoint which contains the name of the external identity provider as a path variable:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/190561611-af9a3324-48b7-458f-b9df-e25c88044cc8.png"
width="80%" title="Azure Active Directory Redirect/Reply URI" %}

{% include googlead1.html  %}

## Attributes

Since authentication is now handed off to an external identity provider, CAS would mainly rely on Azure Active Directory to receive attributes and claims. Of course, you may also want to fetch attributes from your own attribute sources (i.e. LDAP) based on the principal id that is found and calculated from Azure Active Directory.

The following settings, summarily, should do the job:
{% include googlead1.html %}
```
cas.authn.attribute-repository.ldap[0].attributes.uid=uid
cas.authn.attribute-repository.ldap[0].attributes.displayName=displayName
cas.authn.attribute-repository.ldap[0].attributes.cn=commonName
cas.authn.attribute-repository.ldap[0].attributes.memberOf=memberOf

cas.authn.attribute-repository.ldap[0].ldap-url=ldap://...
cas.authn.attribute-repository.ldap[0].base-dn=dc=example,dc=edu
cas.authn.attribute-repository.ldap[0].search-filter=uid={principal}
cas.authn.attribute-repository.ldap[0].bind-dn=...
cas.authn.attribute-repository.ldap[0].bind-credential=...
```

The search filter, `uid={principal}`, indicates that the LDAP query should find the record whose `uid` attribute matches the *principal* id that is resolved from external authentication.

## Multifactor Authentication

As part of external authentication, you may be configuring Azure Active Directory to put users through a multifactor authentication flow. This flow is typically signaled back to CAS via the `amr` claim that is submitted from Azure Active Directory to CAS in form of a multivalued attribute with values such as [`mfa`, `password`]. You in turn may want to configure CAS to translate the `amr` claim to a SAML2 required authentication class when the final SAML2 response is submitted back to the SAML2 client application.
{% include googlead1.html %}
The required authentication class that would be sent to SAML2 service provider should then be:

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

This can be handled using the following settings:

```
cas.authn.saml-idp.core.authentication-context-class-mappings[0]=https://refeds.org/profile/mfa->mfa
cas.authn.mfa.core.authentication-context-attribute=amr
```
{% include googlead1.html %}
The above configuration instructs CAS to use `https://refeds.org/profile/mfa` as the authentication context class only if the `amr` claim contains a value that matches `mfa`.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[delegation]: https://apereo.github.io/cas/development/integration/Delegate-Authentication.html
[saml2]: https://apereo.github.io/cas/development/authentication/Configuring-SAML2-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html