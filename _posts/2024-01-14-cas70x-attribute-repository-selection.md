---
layout:     post
title:      Apereo CAS - Attribute Repository Selection Rules
summary:    Learn how to connect and link authentication attempts to person-attribute sources to control and filter data that is shared with registered applications and relying parties.
tags:       ["CAS 7.0.x", "Attribute Resolution"]
---

In the landscape of identity and access management, the ability to seamlessly connect authentication sources with attribute repositories that produce personal data plays a pivotal role in shaping a robust and flexible system. Apereo CAS not only provides a secure and centralized authentication framework but also empowers operators to orchestrate the retrieval of personalized user data with precision. Imagine a scenario where an authentication source wields the power to dictate how user data is retrieved from a specific repository, providing administrators with control to streamline the authentication process and ensuring that only the most relevant and essential user attributes are accessed and released.

{% include googlead1.html %}

In this post, we delve into the Apereo CAS features that enable dynamic authentication source linking. This post specifically focuses on:

- CAS `7.0.x`
- Java `21`

# Setup

Let's imagine that our CAS server is configured to fetch attributes from the following attribute repository sources:
{% include googlead1.html %}
```
cas.authn.attribute-repository.json[0].location=/path/to/repository.json 1️⃣
cas.authn.attribute-repository.json[0].id=MyJson

cas.authn.attribute-repository.stub.id=StaticStub 2️⃣
cas.authn.attribute-repository.stub.attributes.displayName=Apereo CAS

cas.authn.accept.name=STATIC 3️⃣
```

Here is what's happening:

1️⃣ We define an attribute repository identified as `MyJson` that pulls user data from a flat JSON file:
{% include googlead1.html %}
```json
{
  "casuser": {
    "employeeNumber": [
      "123456"
    ],
    "lastName": [
      "Johnson"
    ]
  }
}
```

2️⃣ We define an attribute repository identified as `StaticStub` that produces static values for the current user.
{% include googlead1.html %}
3️⃣ We have one authentication source that is named and identified as `STATIC`.

# Application Policy

Let's say we have an application that is registered with CAS whose relevant user attributes can only be found in the `MyJson` attribute repository. In other words, when users wish to log into this application via CAS, CAS must only contact the `MyJson` attribute repository and fetch user attributes. This can be done via `principalAttributesRepository` constructs:
{% include googlead1.html %}
```json
{
  "@class" : "org.apereo.cas.services.CasRegisteredService",
  "serviceId": "^https://app.example.org",
  "name" : "MyApp",
  "id" : 1,
  "attributeReleasePolicy" : {
    "@class" : "org.apereo.cas.services.ReturnAllAttributeReleasePolicy",
    "principalAttributesRepository" : {
      "@class" : "org.apereo.cas.authentication.principal.DefaultPrincipalAttributesRepository",
      "attributeRepositoryIds": ["java.util.HashSet", [ "MyJson" ]]
    }
  }
}
```

Because the attribute release policy for this application allows the release of all attributes, CAS would release `employeeNumber` and `lastName` to this application, both of which are only found inside the JSON attribute repository. All other attribute sources are ignored.

# Global Policy

Let's take this one step further and imagine a scenario that forces CAS to only select the `StaticStub` attribute repository for all authentication attempts, regardless of the application. We could of course go back to our policy and specify `StaticStub` inside the `attributeRepositoryIds` attribute, but this means we would have to duplicate this construct for all other applications as well.Furthermore, this change says nothing about the type of the authentication source. If we add a few more forms of authentication in the future, we still need to find a way to restrict and link our current form of authentication to the `StaticStub` attribute repository and leave others alone.
{% include googlead1.html %}
To handle this, we have to go back and remove the `principalAttributesRepository` block from our application policy and instead specify the following CAS configuration setting:
{% include googlead1.html %}
```properties
cas.person-directory.attribute-repository-selection.STATIC=StaticStub
```

This teaches CAS that whenever the `STATIC` authentication method is employed, it should only contact `StaticStub` to fetch attributes for the application, as long as the application itself does not present override inside its policy with the likes of `principalAttributesRepository`...which we of course removed already.

# O Cache! My Cache!

Now that we are here, let me present the following quiz. We have a CAS server with an identical setup as before, but this time around the following two separate application policies exist:

- Application `A` is configured to talk to `MyJson` only.
- Application `B` has no such override in its policy and therefore, CAS would fall back to its own global selection rules choosing `StaticStub` instead as the attribute repository of choice.

So far, so good? OK. Now, let's walk through the following flow:
{% include googlead1.html %}
1. User attempts to access application `A`, logs in via CAS, and expects attributes to be found and released via the `MyJson` attribute repository. This is correct, right? 
2. Then, the user logs out of CAS.
3. User attempts to access application `B`, logs in via CAS, and expects attributes to be found and released via the `StaticStub` attribute repository. Except that does not happen. Instead, the user continues to receive attributes that were previously found via `MyJson` attribute repository!

Why? 

Why indeed. This happens because:

- The user's first attempt which contacts the `MyJson` attribute repository forces CAS to cache the attributes. 
- ...and it's important to note that the cache is for the most part only tied to the user identifier. The source is not taken into account. 
{% include googlead1.html %} 
- Logout operations do not invalidate or kill the attribute repository cache.
- ...which means, the next login attempt to application `B` allows CAS to reuse the attribute repository cache results for the same user, meaning there is no need to contact any other repository. 

To get around this problem in such scenarios, you may need to disable the cache:
{% include googlead1.html %}
```properties
cas.authn.attribute-repository.core.expiration-time=0
```

Once the cache is nuked, CAS will correctly contact the relevant attribute repositories as they vary from one application policy to the next. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html