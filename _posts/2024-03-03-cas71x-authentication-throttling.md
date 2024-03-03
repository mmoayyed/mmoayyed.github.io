---
layout:     post
title:      Apereo CAS - Authentication Throttling
summary:    Learn how to configure Apereo CAS to throttle authentication requests to prevent password guessing and related abuse scenarios.
tags:       ["CAS 7.1.x", "Authentication"]
---

Apereo CAS provides a facility for limiting failed login attempts to prevent password guessing and related abuse scenarios. By limiting the number of failed login attempts, authentication throttling not only safeguards user credentials but also fortifies overall system security, thereby ensuring robust protection against abuse scenarios and unauthorized access.

{% include googlead1.html %}
In this post, we are going to take a brief look at what it takes to throttle failed authentication attempts. This tutorial specifically focuses on:

- CAS `7.1.x`
- Java `21`

# Setup

Once you have included the [correct module](https://apereo.github.io/cas/development/authentication/Configuring-Authentication-Throttling.html#failure-throttling) in your CAS overlay, you will need to decide on a strategy to track failed authentication requests. A common way would be to opt for the combination of the user's source IP and username. This option would limit successive failed logins against a particular user from the same IP address.
{% include googlead1.html %}
```properties
cas.authn.throttle.core.username-parameter=username
```

# Failure Thresholds

All login throttling components that ship with CAS limit successive failed login attempts that exceed a threshold rate, which is a time in seconds between two failures. You will need to define the failure rate using the following variables:
{% include googlead1.html %}
- `threshold` - Number of failed login attempts.
- `rangeSeconds` - Time in seconds.

A failure rate of more than 1 per 3 seconds is indicative of an automated authentication attempt, which is a reasonable basis for a throttling policy.
{% include googlead1.html %}
```properties
cas.authn.throttle.failure.threshold=1
cas.authn.throttle.failure.range-seconds=3
```

The failure threshold rate is calculated as: `threshold / rangeSeconds`. For instance, the failure rate for the above scenario would be `0.333333`. An authentication attempt may be considered throttled if the request submission rate (calculated as the difference between the current date and the last submission date) exceeds the failure threshold rate.

# Stale Throttled Attempts

In our setup, throttled requests and submissions are tracked in the runtime memory of the CAS server node. We will need to find a way to clean expired and stale submissions so they may be resumed and renewed once the failure threshold passes. This is done using a background runs that runs on a schedule to examine throttled submissions and clean/remove anything that is expired:
{% include googlead1.html %}
```properties
cas.authn.throttle.schedule.enabled=true
cas.authn.throttle.schedule.start-delay=PT10S
cas.authn.throttle.schedule.repeat-interval=PT60S
```

# Locking Throttled Accounts

Once a user attempt is throttled, you may want to completely lock that account/attempt for a defined period:
{% include googlead1.html %}
```properties
cas.authn.throttle.failure.throttle-window-seconds=PT15M
```

This setting indicates the number of seconds the account should remain in a locked/throttled state before it can be released to continue again. No matter what the user does, the account and the request will remain blocked for `15` minutes before the submission is released.

# Distributed Submission Store

Deployments with multiple CAS nodes behind a load balancer configured with session affinity can use the default in-memory setup to track throttled submissions. Since load balancer session affinity is determined by source IP address, which is the same criterion by which throttle policy is applied, an attacker from a fixed location should be bound to the same CAS server node for successive authentication attempts. 
{% include googlead1.html %}
CAS also provides options that allow you to distribute the throttled submission store across multiple CAS nodes. This option removes the need for session affinity and allows any CAS node in the cluster to have access to the same centralized submission store to detect throttled accounts and block access.

One possible option would be to distribute throttled entries with [Hazelcast](https://apereo.github.io/cas/development/authentication/Configuring-Authentication-Throttling-Hazelcast.html):
{% include googlead1.html %}
```properties
cas.authn.throttle.hazelcast.cluster.core.instance-name=CAS
cas.authn.throttle.hazelcast.cluster.network.members=1.2.3.4,5.6.7.8
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
