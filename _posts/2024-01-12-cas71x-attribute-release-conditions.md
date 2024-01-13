---
layout:     post
title:      Apereo CAS - Conditional Attribute Release Policies
summary:    Learn how to configure CAS to conditionally activate attribute release policies to share claims and attributes with applications and relying parties dynamically and only when necessary.
tags:       ["CAS 7.1.x", "Attribute Resolution"]
---

Apereo CAS continues to stand out as a robust and versatile solution, evolving to meet the ever-changing needs of institutions and organizations. One key feature typically takes center stage: the refined approach to attribute release policies. Apereo CAS enables the controlled sharing of attributes and personal data with applications and registered relying parties. The evolution of attribute release policies in CAS not only emphasizes heightened security and privacy but also introduces the power of conditional activation.

{% include googlead1.html %}

In this post, we'll uncover the mechanisms that empower CAS operators to tailor attribute release policies based on specific conditions. Our starting position is based on:

- CAS `7.1.x`
- Java `21`

# Basics

The typical attribute release policy in Apereo CAS allows and authorizes a registered application to receive a pre-defined set of attributes:

{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "MyApplication",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "cn", "mail", "sn" ] ]
  }
}
```

The attributes `cn`, `mail`, `sn` are expected to have been found and fetched already by CAS via its attribute resolution and retrieval mechanisms. Once available, they would be released to `https://app.example.org` via the normal semantics of the CAS protocol, given the application is registered with CAS as a `CasRegisteredService`.
{% include googlead1.html %}
<div class="alert alert-info">
  <strong>Note</strong><br/>Once more, remember that an attribute release policy does not fetch attributes from attribute sources, or at least that happens to be true in the above example. It only authorizes the release of defined attributes to applications when the time comes.
</div>

Note that the same strategy and construct works with any other type of application registered with CAS. For example, here is an attribute release policy that releases the same claims to the same application, though this time registered as an OpenID Connect relying party: 
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.OidcRegisteredService",
  "serviceId" : "https://app.example.org",
  "clientId": "client",
  "clientSecret": "secret",
  "name" : "MyApplication",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "cn", "mail", "sn" ] ]
  }
}
```

# Conditions

In the above examples, the attribute release policy that is assigned to a registered application will be activated and processed whenever the need and the request does show up. The policy will run all the time and its activation condition is always on and positive. What if you wanted to deactivate the release policy based on certain criteria and conditions? This is where the *activation criteria* for the policy come in to help:
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "MyApplication",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "cn", "mail", "sn" ] ],
    "activationCriteria": {
        "@class": "org.apereo.cas.services.AttributeBasedRegisteredServiceAttributeReleaseActivationCriteria",
        "requiredAttributes": {
          "@class" : "java.util.HashMap",
          "memberOf": [ "java.util.ArrayList", [ ".+admin.+" ] ]
        }
    }
  }
}
```
{% include googlead1.html %}
In the above example, the attribute release policy is only ever activated to process attribute release rules when the authenticating user has a `memberOf` attribute with at least one value that would match the pattern `.+admin.+`. If this condition holds, the policy will process the defined attributes and if it holds false, the release policy will authorize and release nothing.

You could also do the opposite:
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "MyApplication",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "cn", "mail", "sn" ] ],
    "activationCriteria": {
        "@class": "org.apereo.cas.services.AttributeBasedRegisteredServiceAttributeReleaseActivationCriteria",
        "reverseMatch": true,
        "requiredAttributes": {
          "@class" : "java.util.HashMap",
          "memberOf": [ "java.util.ArrayList", [ ".+admin.+" ] ]
        }
    }
  }
}
```

In the above example, the attribute release policy is only ever activated to process attribute release rules when the authenticating user has a `memberOf` attribute and *none* of its values *ever* match the pattern `.+admin.+`. 

# Groovy

The activation criteria and conditions above still feel a bit on the static side. For more powerful and dynamic conditions, you can always script the condition and come up with your own rules:
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "MyApplication",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllowedAttributeReleasePolicy",
    "allowedAttributes" : [ "java.util.ArrayList", [ "cn", "mail", "sn" ] ],
    "activationCriteria": {
      "@class":"org.apereo.cas.services.GroovyRegisteredServiceAttributeReleaseActivationCriteria",
      "groovyScript" : "file:///path/to/script.groovy"
    }
  }
}
```

The script itself may be designed as:
{% include googlead1.html %}
```groovy
def run(Object[] args) {
    def (context,logger) = args
    def principal = context.principal
    logger.info("Principal id is ${principal.id}, service is ${context.service}")
    if (principal.id == 'Gandalf') {
        logger.info("User is too powerful; Releasing attributes is allowed")
        return true
    }
    return false
}
```

In the above example, the attribute release policy is only ever activated to process attribute release rules when the authenticating user's ID is equal to `Gandalf`. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
