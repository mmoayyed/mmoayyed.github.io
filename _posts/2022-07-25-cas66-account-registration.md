---
layout:     post
title:      Apereo CAS - Self Service User Account Registration & Sign up
summary:    Learn how to turn on and configure the account registration flow, allowing users to sign up and create accounts.
tags:       ["CAS 6.6.x", "REST", "Identity Management"]
---

Apereo CAS provides a modest workflow to handle self-service account registration and sign-ups. Once enabled, the registration flow allows users to provide an initial, customizable set of details such as first name, last name, and email to kickstart the account creation request. This activation request is followed up by an activation link with instructions via email or text message to verify the account creation request. The activation link should finally allow the user to complete the registration request, choose a password, security questions, etc.
{% include googlead1.html %}
In this post, we will take a look at the configuration steps required to turn on the account registration flow. Our starting position is as follows:

- CAS `6.6.x`
- Java `11`
- [CAS Initializr](https://apereo.github.io/cas/development/installation/WAR-Overlay-Initializr.html)

# Overview

Once you have included the [appropriate CAS module](https://apereo.github.io/cas/development/registration/Account-Registration-Overview.html) in your build, you will need to instruct CAS with the following settings:

```properties
# Allow the activation link to remain valid for 5 minutes
cas.account-registration.core.expiration=PT5M
cas.account-registration.core.isIncludeServerIpAddress=false
cas.account-registration.core.isIncludeClientIpAddress=false

# Email sender settings
cas.account-registration.mail.from=info@fawnoos.com
cas.account-registration.mail.html=true

# Email server configuration
spring.mail.host=localhost
spring.mail.port=25000
```
{% include googlead1.html %}
Account creation requests are expected to be verified using a dedicated activation link that can be shared with the user using mail. You will need to make sure CAS knows how to send the account activation link via email by specifying the details of your email server. Finally, the activation link is expected to remain valid for 5 minutes.

At this point, you should be able to run CAS and see the *Sign Up* link on the CAS login page:

{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/180414002-75ff7fec-b1f5-4067-bf33-088300121614.png" width="70%" title="Apereo CAS Account Registration & Sign up" %}

Once you attempt to sign up, the registration form should appear:

{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/180414401-05ae1ea6-2646-482e-9074-49690a8ae723.png" width="70%" title="Apereo CAS Account Registration & Sign up" %}

Once the registration request is submitted, the activation link should follow via email:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/180415700-fe5d616c-78fa-48db-a870-05a4af7f05c3.png" width="70%" title="Apereo CAS Account Registration & Sign up" %}

Then, once the account is activated, you will be asked to choose a password:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/180418704-9d7660f0-9d66-4dbe-9f40-9dc7090d6397.png" width="70%" title="Apereo CAS Account Registration & Sign up" %}

...and to finalize the flow:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/180418805-42d5cdd4-0e9b-4282-8dcc-17d6b03ac4e3.png" width="70%" title="Apereo CAS Account Registration & Sign up" %}

# Provisioning Accounts

Apereo CAS is **NOT**, as of this writing, an identity management solution and does not intend to provide features or support capabilities that are typically found in such systems, such as provisioning workflows and account lifecycle management, etc. Therefore, rather than storing accounts in some CAS-owned datastore, the provisioning operation supports external systems and identity management solutions that would be able to receive the registration request and store the account as they see fit.

In this setup, we would instruct CAS to use an external REST API to handle the submission of provisioning requests:
{% include googlead1.html %}
```properties
cas.account-registration.provisioning.rest.url=https://api.example.org/accounts
```

This is the option where account registration requests are submitted to an external REST API via a `POST` request that is responsible for managing and storing the account in the appropriate systems of record. The body of the request will contain the account registration request.

Of course, if you are not happy with the provisioning options that exist today, you could always instruct CAS to use your own:
{% include googlead1.html %}
```java
@Bean
public AccountRegistrationProvisionerConfigurer customProvisioningConfigurer() {
    return () -> {
        return new CustomAccountRegistrationProvisioner();
    };
}
```

# Registration Requests

You might be wondering if it's possible to customize the registration form and add/remove fields or introduce additional steps and workflows into the mix before the submission of the activation request. What ships with CAS are a default set of fields and inputs that are described in a JSON document in form of metadata:
{% include googlead1.html %}
```json
{
  "@class" : "java.util.HashMap",
  "field-name" : {
    "@class" : "org.apereo.cas.acct.AccountRegistrationProperty",
    "name" : "field-name",
    "required" : true,
    "label" : "cas.screen.acct.label.field",
    "title" : "cas.screen.acct.title.field",
    "pattern": ".+",
    "type": "email",
    "values" : [ "java.util.ArrayList", [ "sample@gmail.com", "sample2@hotmail.com" ] ],
    "order": 0
  }
}
```

You can certainly alter this metadata and add or remove fields of your choosing by constructing a JSON document and teaching CAS to load it:
{% include googlead1.html %}
```properties
cas.account-registration.core.registration-properties.location=file://path/to/fields.json
```

Additional variations and nuances in the registration flow, as of this writing, will most likely require extra research and development. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html