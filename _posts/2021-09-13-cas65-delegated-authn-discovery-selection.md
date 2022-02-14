---
layout:     post
title:      Apereo CAS - Delegated Authentication w/ Identity Provider Discovery
summary:    Learn how to present external identity providers to Apereo CAS for delegated (proxy) authentication, and choose strategies that allow the user to discover and select an identity provider from a menu statically, or via more dynamic ways.
tags:       ["CAS 6.5.x", "Delegated Authentication"]
---

Apereo CAS has had support to delegate authentication to [external identity providers][delegation] for quite some time. Of course, *delegation* is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate identity provider endpoint, and on the return trip back, CAS is tasked to shake hands, parse the response and extract attributes, etc to establish an authentication session, issue tickets, etc. Delegated authentication is also known as *proxy* authentication, though it should be noted that true *proxy* authentication could also mean something completely different when used in the context of the [CAS protocol][casprotocol].

{% include googlead1.html  %}

The discovery and selection strategy of such identity providers can be done in multiple ways. In this blog post, we will briefly review the configuration required to present identity providers to CAS and have users select one based on different and dynamic parameters.

Our starting position is as follows:

- CAS `6.5.x`
- Java `11`

# Menu Selection

By default, the CAS strategy is to present what one might refer to as the *NASCAR* page; a selection menu that lists all available and authorized identity providers. This is the most common option where you get to pick and choose the provider you like:

{% include googlead1.html  %}

{% include image.html img="https://user-images.githubusercontent.com/1205228/133057482-55f9dc0c-4cca-4066-934b-132f4b546485.png" width="80%" title="Delegated Authentication Identity Provider Menu" %}

Of course, the selection menu is static. That is, all options are presented at once and the system is not able to tailor the user experience to a specific identity provider more dynamically based on additional rules and settings. This is where dynamic discovery comes into effect.

# Dynamic Discovery

To allow CAS to switch to the dynamic identity provider selection mode, we'll need to activate the option first using the following setting:

{% include googlead1.html  %}

```properties
cas.authn.pac4j.core.discovery-selection.selection-type=DYNAMIC
```

When dynamic identity provider selection is activated, CAS allows the user to enter the selection screen rather than listing all available options as before:

{% include image.html img="https://user-images.githubusercontent.com/1205228/133058766-c2d743d7-b673-47c0-81f4-eb646ef50a51.png" width="80%" title="Delegated Authentication Identity Provider Dynamic Selection" %}

In dynamic discovery, CAS would begin to select a specific identity provider based on user input, such as a username or email address. Predefined rules would then determine the proper identity provider to choose based on that user property. Here, the selection screen allows the user to provide an identifier based on which the ultimate identity provider would be determined:

{% include googlead1.html  %}

{% include image.html img="https://user-images.githubusercontent.com/1205228/133059067-ecef79a2-3498-4694-b337-48eb3e03cecc.png" width="80%" title="Delegated Authentication Identity Provider Dynamic Selection" %}


By default, the identity provider selection rules are expected to be found in a JSON resource:

```properties
cas.authn.pac4j.core.discovery-selection.json.location=file:///path/to/rules.json
```

Here is an example that allows CAS to select the identity provider `SAML2Client` if the given user input matches the regular expression pattern `.+@example.org`:

{% include googlead1.html  %}

```json
{
    "@class" : "java.util.HashMap",
    ".+@example.org" : {
      "@class" : "org.apereo.cas.pac4j.discovery.DelegatedAuthenticationDynamicDiscoveryProvider",
      "clientName" : "SAML2Client",
      "order": 0
    }
}
```

Of course, the strategy used to locate the identity provider can be completely customized using the following Spring `@Bean`:

{% include googlead1.html  %}

```java
@Bean
public DelegatedAuthenticationDynamicDiscoveryProviderLocator myLocator() {
    return new CustomLocator();
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[casprotocol]: https://apereo.github.io/cas/6.5.x/protocol/CAS-Protocol.html
[delegation]: https://apereo.github.io/cas/6.5.x/integration/Delegate-Authentication.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html