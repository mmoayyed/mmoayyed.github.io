---
layout:     post
title:      Apereo CAS - SAML2 Identity Provider Discovery
summary:    Learn how to enable SAML2 identity provider discovery and selection when delegating authentication to external SAML2 identity providers.
tags:       ["CAS 7.3.x", "Delegated Authentication", "SAML2"]
---

Apereo CAS has supported delegating authentication to external identity providers for quite some time. Of course, delegation is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate identity provider endpoint, and on the return trip back, CAS is tasked to shake hands, parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. Delegated authentication is also known as proxy authentication, though it should be noted that true proxy authentication could also mean something completely different when used in the context of the CAS protocol.

{% include googlead1.html  %}
The discovery and selection strategy of such identity providers can be done in multiple ways. In this blog post, we will briefly review the configuration required to present SAML2 identity providers to CAS, particularly when such identity providers are supplied to CAS in the form of a metadata aggregate.

Our starting position is as follows:

- CAS `7.3.x`
- Java `21`


# Static Discovery

By default, the CAS strategy is to present what one might refer to as the NASCAR page; a selection menu that lists all available and authorized identity providers. This is the most common option where you get to pick and choose the provider you like:
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/delegation-saml2-idp.png" 
  width="70%" title="Apereo CAS - SAML2 Identity Provider Discovery" %}

# Discovery Service

Identity provider discovery allows CAS to embed and present a discovery service as part of delegated authentication. Configured SAML2 identity providers in the CAS configuration used for delegated authentication are presented as options for discovery.
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/saml2-idp-discovery.png" 
  width="70%" title="Apereo CAS - SAML2 Identity Provider Discovery" %}

CAS is also able to directly consume multiple JSON feeds that contain discovery metadata about available identity providers. The discovery JSON feed may be fetched from a URL (i.e. exposed by a Shibboleth Service Provider) or it may directly be consumed as a JSON file with the following structure:

```
cas.authn.pac4j.saml-discovery.resource[0].location=file:/path/to/feed.json
```

The JSON feed might look like this:
{% include googlead1.html  %}
```json
[
  {
    "entityID": "the-identity-provider-entity-id",
    "DisplayNames": [
      {
        "value": "Okta SAML2",
        "lang": "en"
      }
    ],
    "Descriptions": [
      {
        "value": "An identity provider for the people, by the people.",
        "lang": "en"
      }
    ],
    "Logos": [
      {
        "value": "https://url.com/logo.svg",
        "height": "90",
        "width": "62"
      }
    ]
  }
]
```

You should note that all identity providers need to be registered with CAS. The JSON feed simply provides decoration and additional data for the user interface selection process. It has no way to supply identity provider metadata, etc to CAS. 

# Identity Provider Metadata Aggregates

To make the identity provider registration process a bit more comfortable, CAS supports identity provider metadata aggregates. This is the scenario where CAS acting as a single SAML2 service provider may want to delegate authentication to all recognized identity providers specified in a large metadata aggregate. 
{% include googlead1.html  %}
```
#
# Other relevant settings left out...
#
cas.authn.pac4j.saml[0].metadata.identity-provider-metadata-path=\
  https://md.incommon.org/InCommon/InCommon-metadata-idp-only.xml
cas.authn.pac4j.saml[0].metadata.identity-provider-metadata-aggregate=true
cas.authn.pac4j.saml[0].client-name=SAML2InCommon
```

Note how the service provider is set to support an identity provider metadata aggregate. You may still define a JSON feed to decorate the entries, but CAS will do its best to extract relevant bits from the metadata for each identity provider to determine things like display name, information URLs, etc if the identity provider metadata has the right extensions specified.
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/saml2-idp-metadata-aggregate.png" 
  width="70%" title="Apereo CAS - SAML2 Identity Provider Discovery" %}

Depending on the size of the aggregate file and the number of entries, the initial load and process might take a few seconds.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

It's important that you start off simple and make changes one step at a time. Once you have a functional environment, you can gradually and slowly add customizations to move files around.

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
