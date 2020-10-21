---
layout:     post
title:      Apereo CAS - Reloading Configuration Dynamically
summary:    Learn of secret strategies one may employ to track, manage and dynamically reload CAS configuration and settings without hair loss.
published: true
tags:       [CAS]
---

When it comes to managing and tracking CAS settings, there is a plethora options to choose from for the modest as well as the enterprise-ready. Quickly put, CAS settings can be managed via key-value stores in form of standalone properties or YAML files. Such files can be split up per environment profile, can be fed directly to CAS at runtime or via command-line parameters, environment variables, inline JSON feeds, JVM system properties, [slurpped via Groovy](https://fawnoos.com/2018/11/02/cas6-groovy-config-slurper/) or even managed inside a separate and external [configuration server](https://fawnoos.com/2018/10/25/cas6-cloud-config-server/) which feed data to a CAS server from many other storage services and databases on a per-profile basis. All of this capability is provided by and built on top of Spring Boot and Spring Cloud frameworks that provide quite a flexible design in keeping track of one's application settings.

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

A reasonable question one might casually wonder about could be: "If I make a change to CAS configuration, can the server recognize it automatically without a restart?"

The answer, like most things in life, is: *"That depends"*. This blog post attempts to address that question and explores a number of options in this area that might serve as good starting points for further development and tuning.

Our starting position is based on:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Initial Setup

Let's start with a simple use case: our CAS server should have the option to hand off authentication requests to an external CAS server. To enable [delegated authentication](https://apereo.github.io/cas/6.2.x/integration/Delegate-Authentication.html), we would start by including the proper extension module in the overlay:

```gradle
compile "org.apereo.cas:cas-server-support-pac4j-webflow:${project.'cas.version'}"
```

...and our `cas.properties` would at a minimum include the following:

```
cas.authn.pac4j.cas[0].loginUrl=https://othersso.example.org/cas/login
cas.authn.pac4j.cas[0].protocol=CAS30
cas.authn.pac4j.cas[0].clientName=External CAS
cas.authn.pac4j.cas[0].enabled=true
```

Also, to allow for [configuration reloadability](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Management-Reload.html), we would need the following module as well:

```gradle
compile "org.apereo.cas:cas-server-core-events-configuration:${project.'cas.version'}"
compile "org.apereo.cas:cas-server-support-reports:${project.'cas.version'}"
```

If you build and run CAS next, you'd something similar to the below image:

![image](https://user-images.githubusercontent.com/1205228/61612088-c7cf1f80-ac72-11e9-91ab-34c945259dee.png)

# Dynamic Reloads

## Standalone Configuration

Let's say you're disappointed with the chosen name of the external CAS server as *External CAS* and you would be a lot more comfortable if the label (and the identity provider's name) changed to *Interesting CAS*. To apply the change while CAS is running, simply change the property value and wait a few tiny seconds for it to take effect:

```
cas.authn.pac4j.cas[0].clientName=Interesting CAS
```

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

If you watch your logs next once you have saved the file, you would likely see something similar to the below lines:

```bash
...
<CAS finished rebinding configuration with new settings [[cas.authn.pac4j.cas[0].clientName]]>
...
```

At this point, if you simply refresh the browser screen the label should have changed to *Interesting CAS*.

<div class="alert alert-info">
<strong>Removing Settings</strong><br/>Spring Cloud, the underlying library responsible for refreshing the CAS Spring application context on changes, does not recognize properties and settings that are removed and commented out; only actual changes to the settings are recognized. See <a href="https://github.com/spring-cloud/spring-cloud-config/issues/476">this issue for better details</a>.
</div>

## Spring Boot Admin

Once you have the Spring Boot Admin web application [up and running](https://fawnoos.com/2018/10/22/cas6-springboot-admin-server/), you can browse over to the *Configuration Properties* panel to see all CAS settings. To make the same change, hop over to the *Environment* panel and under *Environment Manager* type in `cas.authn.pac4j.cas[0].clientName` for the property name and *Fancy CAS Here* for the value:

![image](https://user-images.githubusercontent.com/1205228/61623008-27392980-ac8b-11e9-8c9d-fa377f27f976.png)


...and at this point, if you simply refresh the browser screen:

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

![image](https://user-images.githubusercontent.com/1205228/61623183-6c5d5b80-ac8b-11e9-8490-9169d36aaf5b.png)

<div class="alert alert-info">
<strong>Refreshing Collections</strong><br/>Spring Boot has opted for much stricter rules when it comes to refresh and binding values and settings that belong to a collection. See <a href="https://github.com/spring-projects/spring-boot/issues/9137">this issue for better details</a>.
</div>

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://twitter.com/misagh84)