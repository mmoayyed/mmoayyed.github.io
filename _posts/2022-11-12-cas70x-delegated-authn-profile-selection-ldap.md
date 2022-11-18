---
layout:     post
title:      Apereo CAS - Delegated Authentication Profile Selection
summary:    Learn how to link a user profile from an external identity provider in delegated authentication flows, allowing the user to select the final profile from a list of candidates found in LDAP directories of your choice.
tags:       ["CAS 7.0.x", "Delegated Authentication", "LDAP"]
---

Apereo CAS can be configured to route or *delegate* authentication to an external identity provider. *Delegation*, of course, is just a fancy word that ultimately means, whether automatically or at the click of a button, the browser is expected to redirect the user to the appropriate endpoint owned by some external identity provider, and on the return trip back, CAS is tasked to parse the response and extract claims, etc to establish an authentication session, issue tickets, etc. In other words, in delegated scenarios, the main identity provider is an external system in this case and CAS simply begins to act as a client or *proxy* in between.

{% include googlead1.html  %}

In this post, we will focus on available strategies that allow CAS to link a user profile from an external identity provider in delegated authentication flows to an internal account or accounts, allowing the user to select the final profile from a list of candidates found in LDAP directories of your choice.

This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `17`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Overview

Delegated authentication flows can be customized to allow the end-user to select an authentication profile, in cases where the user account produced by the identity provider can match multiple records and is linked to multiple personas in an internal account store such as an LDAP directory. When multiple matches are found, the CAS user interface allows the end-user to select the appropriate profile with which authentication should resume.

{% include googlead1.html  %}

For example, an external identity provider might pass back the user profile with an identifier that matches a specific attribute in your LDAP directory. This match can produce multiple records for the same user, and we want CAS as the secondary identity provider to allow the user to choose the correct persona from the list available profiles and use that persona to establish the single sign-on session.

# Configuration

Assuming you have [prepared your build][profileselection], you need to instruct CAS to query the LDAP directory to find the appropriate accounts and return those back to the user interface for selection: 

```properties
cas.authn.pac4j.profile-selection.ldap.ldap-url=ldap://localhost:10389
# ...
# Other LDAP settings listed here...
# ...
cas.authn.pac4j.profile-selection.ldap.profile-id-attribute=cn
cas.authn.pac4j.profile-selection.ldap.attributes=sn,givenName,uid,mail,cn
```
{% include googlead1.html  %}
That last two settings are rather important: `profile-id-attribute` instructs CAS to use a dedicated attribute for the candidate profile(s) that are built and passed back to the user interface, and of course the `attributes` setting allows CAS to fetch a collection of attributes for that profile from LDAP, and make those available for later processing.

That should be all. If the LDAP query produces records, CAS would prompt the end-user to make a decision and select the appropriate profile:
{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/201483395-e37a68ef-c886-4591-a67c-ec53eefc71ae.png"
width="80%" title="Delegated Authentication Profile Selection" %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[profileselection]: https://apereo.github.io/cas/development/integration/Delegate-Authentication-ProfileSelection.html
[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html