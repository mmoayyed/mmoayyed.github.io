---
layout:     post
title:      Apereo CAS - Supercharged JSON Service Registry 
summary:    Learn how to take advantage of advanced features of the Apereo CAS JSON Service Registry to manage, maintain, and protect application registration records.
tags:       ["CAS 6.3.x", "Service Integrations"]
---

Apereo CAS offers a large menu of options for managing client application registration records. Over the years, the [JSON Service Registry](https://apereo.github.io/cas/6.2.x/services/JSON-Service-Management.html) has become quite the popular choice given its configuration simplicity and low maintenance overhead. Depending on the type of client application being registered and the authentication protocol used, there are a few hidden *gems* available to the adopters of the JSON Service Registry that should prove quite advantageous when it comes to managing secrets, dynamic application reconfiguration at runtime, etc. 

{% include googlead1.html  %}

Our starting position is as follows:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- [JSON Service Registry](https://apereo.github.io/cas/6.2.x/services/JSON-Service-Management.html)
- [CAS Command-line Shell](https://apereo.github.io/cas/6.2.x/installation/Configuring-Commandline-Shell.html)

# Protecting Secrets

When CAS is configured to act as an [OAuth Identity Provider](https://apereo.github.io/cas/6.2.x/installation/OAuth-OpenId-Authentication.html), OAuth client applications and relying parties (i.e. *RP*s) are required to register their presence with the CAS server to allow for successful integrations. The RP registration record typically consists of several required fields, such as client id, redirect URI and, relevant to our discussion here, a client secret. If we are to manage such registration records via the [JSON Service Registry](https://apereo.github.io/cas/6.2.x/services/JSON-Service-Management.html), that would mean the client secret would be exposed in plain text and available to anyone with access to the file system! 

{% include googlead1.html  %}

Fortunately, client secrets can also be kept as encrypted secrets. Authorized relying parties always have access to and submit the client secret in plain text in their exchanges with the Apereo CAS server. However, when dealing with encrypted secrets, CAS can auto-reverse the encryption of the secret found in the JSON service definition file for verification and matching.

Skipping other details, our JSON service file could take on the following form:

```json
{
  "@class" : "org.apereo.cas.support.oauth.services.OAuthRegisteredService",
  "clientId": "client",
  "clientSecret": "{cas-cipher}eyJhbGciOiJIUzUxMiIs...",
  "serviceId" : "https://example.net/dashboard",
  "name" : "OAUTH",    
}
```

All you'd have to do is to take a plain secret and use the [CAS Command-line Shell](https://apereo.github.io/cas/6.2.x/installation/Configuring-Commandline-Shell.html) to transform it into encrypted form. The encryption and signing keys for client secrets may be defined via the following settings:

{% include googlead1.html  %}

```properties 
cas.authn.oauth.crypto.encryption.key=...
cas.authn.oauth.crypto.signing.key=...
cas.authn.oauth.crypto.enabled=true
cas.authn.oauth.crypto.signing-enabled=true
cas.authn.oauth.crypto.encryption-enabled=true
```

# Configuration Expression Language

A rather recent addition to the CAS features portfolio is support for the [Spring Expression Language](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Spring-Expressions.html), particularly used but not limited to reconfigure fields and properties of a JSON service definition file at runtime. This could be useful when the component wishes to have access to system properties, environment variables or in general requires a more dynamic or programmatic strategy for configuration before it can be fully functional.

{% include googlead1.html  %}

For example, consider the following JSON service definition with a specialized attribute release policy:

```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "sample",
  "name" : "sample",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.GroovyScriptAttributeReleasePolicy",
    "groovyScript" : "file:${#systemProperties['java.io.tmpdir']}/ExampleScript.groovy"
  }
}
```

At runtime, CAS will automatically resolve the path specified for the `groovyScript` based on the system property defined under `java.io.tmpdir`. In practice, the JSON definition file could be translated to the following:

```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "sample",
  "name" : "sample",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.GroovyScriptAttributeReleasePolicy",
    "groovyScript" : "/tmp/ExampleScript.groovy"
  }
}
```

{% include googlead1.html  %}

Of course, you're allowed to use any system property or environment variable defined to reconfigure the service definition. Furthermore, the behavior is not exclusive to `GroovyScriptAttributeReleasePolicy` but to a large number of CAS components or even properties. Eligible components should be pointed out in the official CAS reference documentation with a small note that might read: *The configuration of this component qualifies to use the Spring Expression Language syntax.*.

[See this guide](https://apereo.github.io/cas/6.2.x/configuration/Configuration-Spring-Expressions.html) to learn more about this feature.


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)