---
layout:     post
title:      Apereo CAS - Grouper Integrations
summary:    Fetch user groups from Internet2's Grouper and collect their CAS attributes for application access enforcement and better healthcare.
tags:       ["CAS 6.6.x", "Attribute Resolution", "Authorization"]
---

Apereo CAS can be configured for several possible integration options with [Grouper](https://incommon.org/software/grouper/), which is described as:

> Grouper simplifies access management by letting you use the same group or role in many places in your organization. It automates changes to access privileges as a person’s role changes. 

When it comes to connecting Grouper with Apereo CAS, one rather common use case might be to fetch and retrieve user groups from Grouper, turn them into regular attributes in CAS, and then design authorization rules and access strategies for applications based on those groups. This use case is the subject of this blog post.

{% include googlead1.html %}

This post specifically requires and focuses on:

- CAS `6.6.x`
- Java `11`
- [Apereo CAS Initializr][initializr] 

# Configuration

To allow CAS to retrieve user groups from Grouper would mean that CAS would read all the groups from Grouper for the given CAS principal and adopts them as CAS attributes under a `grouperGroups` multi-valued attribute. To do so would be as quick as including this module into the CAS WAR overlay build:
{% include googlead1.html %}
```groovy
implementation "org.apereo.cas:cas-server-support-grouper"
```

Optionally, we might also consider including the following settings in our `cas.properties`:
{% include googlead1.html %}
```properties
cas.authn.attribute-repository.grouper.id=Grouper
cas.authn.attribute-repository.grouper.subject-type=SUBJECT_ID
```

The `subject-type` is somewhat important; it indicates how the username passed to the attribute repository should be set and treated by the Grouper client library internally used by CAS to look up records. 

Finally, you should of course configure the Grouper client library that is used by CAS to include the address of the Grouper server and other necessary settings. This is done via a `src/main/resources/grouper.client.properties` configuration file that at a minimum should contain the following:
{% include googlead1.html %}
```properties
# grouperClient.webService.url = https:/{grouper-server-address}/grouper-ws/servicesRest
# grouperClient.webService.login = ...
# grouperClient.webService.password = ...
```

Based on the above configuration and assuming the CAS server is configured to use LDAP for authentication, we could safely expect that if a `casuser` user logs in via LDAP, the end result should be an authenticated CAS principal for `casuser` whose group memberships are collected into a `grouperGroups` attribute. If you wanted to change this setup and allow CAS to query Grouper under a different user attribute (that is found for the user during the authentication event) you might consider setting up the following:
{% include googlead1.html %}
```properties
cas.authn.attribute-repository.grouper.username-attribute=alternative-attribute
```

# Access Strategy

Next, setting up the access strategy based on group memberships should prove quite simple. For example, the below policy grants access to the given application only if the user has a group membership that contains the text `gmem-admin`:
{% include googlead1.html %}
```json
{
  "@class": "org.apereo.cas.services.CasRegisteredService",
  "serviceId": "https://library.example.org/admin",
  "name": "LibraryApp",
  "id": 1,
  "accessStrategy" : {
    "@class" : "org.apereo.cas.services.DefaultRegisteredServiceAccessStrategy",
    "requiredAttributes" : {
      "@class" : "java.util.HashMap",
      "grouperGroups" : [ "java.util.HashSet", [ ".*gmem-admin.*" ] ]
    }
  }
}
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
[qrauthn]: https://apereo.github.io/cas/6.6.x/authentication/QRCode-Authentication.html
[initializr]: https://casinit.herokuapp.com