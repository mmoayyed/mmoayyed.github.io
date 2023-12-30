---
layout:     post
title:      Apereo CAS - Suspicious Authentication Attempts
summary:    Learn how to tune the Apereo CAS deployment to track and detect risky authentication attempts based on a variety of factors, while allowing for follow-up configurations and verifications.
tags:       ["CAS 7.0.x", "Authentication", "GeoLocation"]
---

In today's digital landscape, where data breaches and cyberattacks are on the rise, ensuring the security of user authentication has never been more critical. The need to protect sensitive information and user identities from malicious actors is paramount, making it imperative for organizations to deploy robust authentication solutions that not only streamline user access to various services but also play a pivotal role in identifying and thwarting risky, suspicious authentication attempts.

{% include googlead1.html  %}

Apereo CAS is a versatile authentication solution that stands as a bulwark against unauthorized access and fraudulent login attempts. Apereo CAS doesn't just stop at authenticating users; it goes a step further by employing an array of sophisticated methods to detect and respond to suspicious authentication activities. In this blog post, we will explore how Apereo CAS excels in detecting [risky authentication][risk] attempts. Our starting position is as follows:

- CAS `7.0.x`
- Java `21`

# Scenario

To detect risky authentication attempts, we must first find a suitable solution to store and track authentication requests and results. CAS provides several backend options to store authentication events and to keep matters simple, we will go with a default [in memory][events] option. Once in place, we would want the detection mechanism to be based on a rate of authentication attempts from suspicious IP addresses. We would want CAS to calculate an averaged risk rate based on previous authentication attempts and the calculated rate would be compared and measured against an accepted threshold. The risk threshold factor is one beyond which the authentication event may be considered risky:
{% include googlead1.html  %}
```properties
cas.authn.adaptive.risk.ip.enabled=true
cas.authn.adaptive.risk.core.threshold=0.2
```

In this particular setup, if the *authentication risk score* is above the defined threshold, CAS would begin to block the authentication attempt by default.

# Risk Confirmation

When a risky authentication attempt is detected, you may also configure CAS to notify the user via, let's say, a dedicated email message:
{% include googlead1.html  %}
```properties
cas.authn.adaptive.risk.response.mail.subject=Risky Authentication
cas.authn.adaptive.risk.response.mail.text=file:/path/to/email.gtemplate
```

The email template, here defined especially as a Groovy template, does receive several inputs from CAS so that we may formulate the content dynamically. A typical example might be:

```groovy
Hello ${authentication.principal.id},
Verify your authentication attempt at ${verificationUrl}
```

The `verificationUrl` parameter is important because it allows the user to confirm and own the authentication attempt. This confirmation is recorded by CAS and allows the risk engine to make better decisions in the future when similar attempts are detected. The verification link presented in the email remains active for a while, and its expiration can be controlled:
{% include googlead1.html  %}
```properties
cas.authn.adaptive.risk.response.risk-verification-token-expiration=PT1M
```

Risk confirmation attempts are only evaluated up to a point in history, typically `7` days. That is to say, subsequent authentication attempts that are detected as risky (and resemble similar traits) are then evaluated against previous confirmations in history for the past `7` days. Once we move beyond this point in the history of authentication attempts, the confirmations no longer hold and the user will be asked to verify their attempt again. You may of course control the duration of this window via:
{% include googlead1.html  %}
```properties
cas.authn.adaptive.risk.response.risk-verification-history=P7D
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[events]: https://apereo.github.io/cas/7.0.x/authentication/Configuring-Authentication-Events.html
[risk]: https://apereo.github.io/cas/7.0.x/authentication/Configuring-RiskBased-Authentication.html
