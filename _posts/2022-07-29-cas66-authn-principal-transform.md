---
layout:     post
title:      Apereo CAS - Username & Principal Transformations
summary:    A short overview of how usernames can be transformed and modified before the credential submission for the authentication request in Apereo CAS.
tags:       ["CAS 6.6.x", "Authentication"]
---

When Apereo CAS is configured to accept a username/password credential type, you might need to modify the submitted username before it can be accepted by CAS for authentication and validation. Typical use cases would be to transform the username into all uppercase characters, subtract and remove certain characters from the provided id, and/or allow multiple forms of a username that would then be translated into an output CAS would understand for authentication.

{% include googlead1.html %}

This blog post briefly looks at several options that allow one to transform and modify usernames before submission. Our starting position is as follows:

- Apereo CAS `6.6.x`
- [CAS Initializr](https://apereo.github.io/cas/development/installation/WAR-Overlay-Initializr.html)

# Overview

Authentication strategies (i.e. *handlers*) in Apereo CAS that generally deal with username-password credentials can be configured to transform the user id before executing the authentication sequence. Each authentication strategy in CAS provides settings to properly transform the principal. For this post, let's assume that Apereo CAS is configured to use LDAP authentication via the following settings:
{% include googlead1.html %}
```
cas.authn.ldap[0].ldap-url=ldaps://auth.example.org
cas.authn.ldap[0].base-dn=dc=example,dc=edu
cas.authn.ldap[0].search-filter=sAMAccountName={user}
cas.authn.ldap[0].bind-dn=...
cas.authn.ldap[0].bind-credential=...
cas.authn.ldap[0].type=AUTHENTICATED
```

This is a very basic setup that allows the user to log in using `username` and `pa$$word` credentials, where the LDAP record is initially found by matching the username against the `sAMAccountName` attribute.

# Use Cases

If we wanted to allow the user to submit both `username` and `username@example.org`, one quick strategy would be to modify the filter to *OR* the criteria together. For example,
{% include googlead1.html %}
```
cas.authn.ldap[0].search-filter=(|(mail={user})(sAMAccountName={user}))
```

Of course, this assumes that the `mail` attribute exists and is appropriate for this scenario. If not, we could instruct CAS to take `username@example.org`, and subtract the *username part* before validating the credential:

```
cas.authn.ldap[0].principal-transformation.pattern=(\w+)@\w+.org
```
{% include googlead1.html %}
The defined `pattern` is a regular expression that will be used against the provided username for username extractions. On a successful match, the first matched group (i.e. `(\w+)`) in the pattern will be used as the extracted username. If no match is found, the provided username will be used as is.

Alternatively, what if you never wanted the user to ever submit an email address for the username? How about other characters that might be invalid for the deployment? In this case, we could instruct CAS to block and reject the username if it contains anything suspicious:

```
cas.authn.ldap[0].principal-transformation.blocking-pattern=@|$|#
```
{% include googlead1.html %}
Or a more modest variant would be to always transform the given username to all lowercase characters:

```
cas.authn.ldap[0].principal-transformation.case-conversion=LOWERCASE
```

...and of course, if none of the above options deliver the use case we could always script our way into success:

```
cas.authn.ldap[0].principal-transformation.groovy.location=file:/path/to/Transform.groovy
```

The script itself would look like this:
{% include googlead1.html %}
```groovy
def run(final Object... args) {
    def providedUsername = args[0]
    def logger = args[1]

    // return the transformed username
}
```

<div class="alert alert-info">
  <strong>Usage</strong><br/>If you really must, note that you could configure CAS to use all such transforms at the same time. The order of transform execution should then be as follows: Groovy Script, Pattern Matching, Case Conversion and Blocking Pattern. This execution order is not configurable.
</div>

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html