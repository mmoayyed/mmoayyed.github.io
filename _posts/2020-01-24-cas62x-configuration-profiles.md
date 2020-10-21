---
layout:     post
title:      Apereo CAS - Managing Configuration Profiles
summary:    As your CAS deployment moves through the deployment pipeline from dev to test to production, manage the configuration between those environments separately using application profiles.
tags:       [CAS]
background: '/images/home/slide-1.jpg'
---

CAS allows you to externalize your configuration settings so you can work with the same CAS instance in different environments. You can use properties files, YAML files, environment variables and command-line arguments (just to name a few!) to externalize and provide configuration. These strategies present a very flexible and powerful way to manage CAS configuration for production deployments in a variety of use cases. This is a short blog post on how to manage CAS configuration across tiers and avoid duplication of settings as much as possible.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Our starting position is based on:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

In most cases, when you run CAS in [standalone mode](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Server-Management.html#standalone) specially, the default configuration directory on the filesystem (i.e. `/etc/cas/config`) may include `(cas|application).(yaml|yml|properties)` files that can be used to control behavior. You could design your configuration management scheme such that all *common* properties across all deployment environments and tiers are managed inside the likes of `cas.properties` file, while tier-specific settings are separated out into their own individual configuration file, such as `development.properties` and `production.properties` file. 

For example, let's suppose that there are two different deployment environments for development and production where each should contain a different value for the CAS setting `cas.authn.accept.users`. To achieve this, this setting needs to be extracted from the common `cas.properties` file and be put inside `development.properties` and `production.properties` files with relevant values:

Your `development.properties` file would be:

```properties
cas.authn.accept.users=<value-for-development>
```

...and your `production.properties` file would be:

```properties
cas.authn.accept.users=<value-for-production>
```

Finally, you need to make sure the correct configuration profile is activated when CAS is running. One way to achieve this would be to pass along the `spring.profiles.include` parameter as a system property when CAS is run, with a value of the configuration profile appropriate for the tier.

For example, to run with a development profile:

```bash
java -jar -Dspring.profiles.include=development build/libs/cas.war
``` 

...and to run with a production profile:

```bash
java -jar -Dspring.profiles.include=production build/libs/cas.war
``` 

<div class="alert alert-info">
<strong>Note</strong><br/>The above command demonstrates an example with CAS running with an embedded server container, where the <code>spring.profiles.include</code> is passed directly on the command-line. If you are deploying CAS using an external server container, the  setting can be passed to CAS as an environment property as well to make things slightly more comfortable.
</div>

Study [this reference](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Management.html) for more details.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
