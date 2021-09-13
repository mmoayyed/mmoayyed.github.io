---
layout:     post
title:      Apereo CAS - Unique SSO per User
summary:    Learn how to force the Apereo CAS server to maintain a unique SSO session per user account, disallowing multiple logins for the same user in parallel.
published: true
tags:       [CAS]
---

While consulting on a CAS deployment, ran across an interesting question that I think deserves its own post:

> I want allow only one session per each account. If any one trying to login with same credentials and earlier session is still not destroyed then system should prevent the user from logging in.

Since the days of CAS `5.2.x`, CAS has had an authentication policy named as *Unique Principal*, whose appetite can only be satisfied if and only if the requesting user has not already authenticated with CAS. Otherwise the authentication event is blocked, preventing multiple logins.

{% include googlead1.html  %}

Let's explore this policy a little bit more, given the following starting position:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Authentication Policy Configuration

Turning on the policy is in fact quite easy, by including the following setting in the `cas.properties` file:

```properties
cas.authn.policy.unique-principal.enabled=true
```

This will activate the authentication policy but it does come at a cost; To do its job, CAS needs to query the ticket registry and all tickets present to determine whether the current user has established a authentication session anywhere. It examines the content of the ticket registry looking for ticket-granting tickets that may belong to the same user, and if it finds more than one, it will block the authentication attempt. This will surely add a performance burden to the deployment as querying the registry to examine available tickets is not a lighthearted operation. 

{% include googlead1.html  %}


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)