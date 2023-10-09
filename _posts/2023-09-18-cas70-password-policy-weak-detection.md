---
layout:     post
title:      Apereo CAS - Weak Password Detection
summary:    Learn how to tune the password management features of your Apereo CAS deployment to detect and catch weak passwords that fail the strength criteria of your password policy.
tags:       ["CAS 7.0.x"]
---

In an age where cyber threats loom larger than ever before, the need for robust password policies and efficient management tools has become paramount. As organizations navigate the complex landscape of digital security, they seek solutions that not only safeguard sensitive data but also streamline the user experience. Apereo CAS presents password management capabilities that excel in bolstering security through its password policy features and management capabilities.

{% include googlead1.html  %}

Apereo CAS can empower organizations to proactively identify vulnerable accounts with weak passwords, compelling users to update their passwords, and ultimately fortifying the barriers against potential threats. In this post we will take a quick look at the steps required to enable weak password detection with Apereo CAS. Our starting position is as follows:

- CAS `7.0.x`
- Java `21`

# Setup

Let's say we are rolling out a new password policy that requires stronger passwords. To keep matters somewhat simple, the new password policy requires a minimum of `8` and a maximum of `10` characters and we would want to detect all user accounts that are assigned a weak password, failing to pass this new policy. 

All it takes to enable the detection mechanism would be:
{% include googlead1.html  %}
```properties
cas.authn.pm.core.enabled=true
cas.authn.pm.core.password-policy-pattern=^(?=.{8,10}$).*$
```

Any account that fails to pass the strength criteria, as indicated by the above pattern, would be shown the following screen:
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/2023-09-16-20-57-52.png" width="70%" title="Apereo CAS - Weak Password Detection" %}

...which would then force the user to update their password accordig to the password policy:
{% include googlead1.html  %}
{% include image.html img="/images/blog/assets/2023-09-16-20-54-53.png" width="70%" title="Apereo CAS - Weak Password Detection" %}

If you'd rather write your own policy implementation and move the detection logic out of CAS, you can always supply your own implementation via:

```java
@Bean
public AuthenticationPostProcessor passwordStrengthAuthenticationPostProcessor() {
    return new MyOwnPasswordDetectionLogic();
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
