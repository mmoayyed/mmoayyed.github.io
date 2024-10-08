---
layout:     post
title:      Apereo CAS - Slurp Configuration with Groovy
summary:    Learn how CAS configuration may be consumed via Groovy to simplify and consolidate settings for multiple deployment environments and profiles.
tags:       ["CAS 7.0.x", "Groovy"]
---

CAS allows you to externalize your configuration settings so you can work with the same CAS instance in different environments. You can use properties files, YAML files, environment variables and command-line arguments (just to name a few!) to externalize and provide configuration. These strategies present a very flexible and powerful way to manage CAS configuration for production deployments in a variety of use cases. 
{% include googlead1.html  %}
As your CAS deployment moves through the deployment pipeline from dev to test and into production, you can manage the configuration between those environments separately, and be certain that each tier has everything it needs to run when the server migrates. Tier-specific configuration is usually managed and activated through the use of application (aka. Spring) *profiles* while the rest of the more common settings are gathered centrally that apply to all environments. When you run CAS in [standalone mode](https://apereo.github.io/cas/7.0.x/configuration/Configuration-Server-Management.html#standalone) specially, the default configuration directory on the filesystem (i.e. `/etc/cas/config`) may include `(cas|application).(yaml|yml|properties)` files that can be used to control behavior. Such configuration files may also specifically apply to a profile (i.e. `ldap.properties`) that can be activated using `spring.profiles.active` or `spring.profiles.include` settings.

{% include googlead1.html  %}

Starting with CAS `6`, Groovy can also serve as a strategy for loading configuration in a way that allows one to consolidate common and tier-specific files in one place. This tutorial explores that possibility with a starting position is based on the following:

- CAS `7.0.x`
- Java 21

## Groovy `ConfigSlurper`

If you are familiar with Groovy, then `ConfigSlurper` is no stranger to you. This is a utility class for reading configuration files defined in the form of Groovy scripts. Configuration settings can be defined using dot notation or scoped using closures:
{% include googlead1.html  %}
```groovy
 grails.webflow.stateless = true
 smtp {
     mail.host = 'smtp.myisp.com'
     mail.auth.user = 'server'
 }
 resources.URL = "http://localhost:80/resources"
```

CAS takes advantage of this very component, allowing you to isolate tier-specific settings in form of conditional closures. In the simplest scenario, it expects to find a `cas.groovy` file in the same configuration directory while running *standalone* mode that might look like this:
{% include googlead1.html  %}
```groovy
profiles {
    dev {
        cas.authn.accept.users="test::dev"
    }
    prod {
        cas.authn.accept.users="test::prod"
    }
}

cas.common.setting="value"
```

When you run CAS using the `dev` profile, the collection of settings that are picked up from the script are:
{% include googlead1.html  %}
```properties
cas.authn.accept.users="test::dev"
cas.common.setting="value"
```

...and when you run CAS using the `prod` profile, the collection of settings that are picked up from the script are:
{% include googlead1.html  %}
```properties
cas.authn.accept.users="test::prod"
cas.common.setting="value"
```
{% include googlead1.html  %}
For small configuration changes between tiers, this is arguably simpler than having, for example, `cas.properties`, `dev.properties` and `prod.properties` files. For anything else larger and more complicated, you still may want to think about separating settings into multiple files or perhaps consider using the [Spring Cloud Config Server](/2018/10/25/cas6-cloud-config-server/).

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
