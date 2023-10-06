---
layout:     post
title:      Apereo CAS - Account Profile Management
summary:    Review options that allow end-users to examine and review their account profile in a mini portal like environment.
tags:       ["CAS 7.0.x", "Identity Management", "MFA"]
---

Account (Profile) management in CAS allows an authenticated end-user to browse and/or update certain aspects of their account in a mini portal like environment. Whether it's resetting passwords, updating security questions, or scrutinizing login activity and registered devices for multifactor authentication, Apereo CAS's Account (Profile) Management has it covered. 

{% include googlead1.html  %}

In the following sections, we'll break down the key functionalities and advantages of Account (Profile) Management, to give you an understanding of how this feature can enhance your CAS authentication system. Our starting position is as follows:

- CAS `7.0.x`
- Java `21`

# Overview

To activate this feature, you do not need to do anything special. Simply, the following feature toggle(s) must be turned on in your CAS properties:
{% include googlead1.html  %}
```properties
CasFeatureModule.AccountManagement.enabled=true
```

Then, point your browser to the CAS login page via `https://localhost:8443/cas/login`, login and you would see the following:

{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/2023-09-16-20-57-50.png" width="70%" title="Apereo CAS - Account Profile Management" %}

## User Attributes

As an authenticated user, you may examine your current set of attributes that are found and retrieved by CAS:

{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/2023-09-16-20-57-51.png" width="70%" title="Apereo CAS - Account Profile Management" %}

## SSO Sessions

You can also look at all your current single sign-on sessions on various devices and platforms and decide if you'd like to revoke and terminate a session: 
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/2023-10-06-09-37-11.png" width="70%" title="Apereo CAS - Account Profile Management" %}

## Multifactor Authentication

If the CAS server is configured and equipped with a multifactor authentication provider such as Google Authenticator, you may also look at your devices registered with CAS for MFA, or optionally register additional devices:
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/2023-09-16-20-54-12.png" width="70%" title="Apereo CAS - Account Profile Management" %}

The registration option typically should appear if there are no devices registered with CAS for multifactor authentication, or when CAS is configured to allow multiple devices for MFA.

## Password Management

Users may also launch into a password management flow and opt to reset their passwords, update their security questions, etc:
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/2023-09-16-20-54-10.png" width="70%" title="Apereo CAS - Account Profile Management" %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html