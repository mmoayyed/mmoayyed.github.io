---
layout:     post
title:      Apereo CAS - Managing User Attribute Consent Decisions
summary:    Learn to manage, query, and revoke user attribute consent decisions via dedicated REST APIs.
tags:       ["CAS 7.0.x", "Redis"]
---

Apereo CAS provides the ability to require user consent to attribute release. Practically, this means that before accessing the target application, the user will be presented with a collection of attributes allowed to be released to the application with options to either proceed or deny the release of said attributes.

{% include googlead1.html %}

This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `17`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

User consent decisions and options can of course be managed and stored inside a [Redis database](https://apereo.github.io/cas/development/integration/Attribute-Release-Consent-Storage-Redis.html). A super modest setup should include the following settings:
{% include googlead1.html %}
```properties
cas.consent.redis.host=localhost
cas.consent.redis.port=6379
```

Consent attribute records stored in the configured repository are signed and encrypted. To handle this correctly, you need to make sure proper signing and encryption keys are defined for consent records:

```properties
cas.consent.core.crypto.encryption.key=...
cas.consent.core.crypto.signing.key=...
```

<div class="alert alert-info">
  <strong>Note</strong><br/>Remember that such keys must be the same across all CAS nodes, should you want to run CAS in a cluster. On startup, if the settings are left undefined CAS will generate keys for you. You can use the generated keys as a starting point.
</div>

With this basic setup, you should start to see CAS prompt users for attribute consent decisions for all applications that intend to receive attributes from CAS.

# Management

Attribute consent decisions can be managed using a dedicated `attributeConsent` actuator endpoint. Once you have turned on and enabled the endpoint, the following operations are possible.

## Consent Decisions for User

You can obtain and review attribute consent decisions for a user via the following call:

```bash
curl -H 'Content-Type:application/json' \
  -X GET https://${host}/cas/actuator/attributeConsent/${username}
```
{% include googlead1.html %}
Once you have the records, you may decide to remove a decision by its identifier:

```bash
curl -H 'Content-Type:application/json' \
  -X DELETE https://${host}/cas/actuator/attributeConsent/${username}/${id}
```

Or you may decide to remove all decisions for the user:
{% include googlead1.html %}
```bash
curl -H 'Content-Type:application/json' \
  -X DELETE https://${host}/cas/actuator/attributeConsent/${username}
```

## Consent Decisions Import/Export

Consent decisions can be exported into a zip file:

```bash
curl -H 'Content-Type:application/json' \
  -X GET https://${host}/cas/actuator/attributeConsent/export \
  -o consent.zip
```
{% include googlead1.html %}
The outcome of the request is a binary `.zip` file that you can choose to store into a `consent.zip` file. This operation can be handy when if you ever need to switch the backend database to something else. You can export the data into a zip file to a format that CAS can understand later and use to import them back without data loss.

So naturally, there is a parallel operation to import records:

```bash
curl -H 'Content-Type:application/json' \
  -X POST https://${host}/cas/actuator/attributeConsent/import \
  -d @path/to/data.json
```
{% include googlead1.html %}
The `data.json` should contain the consent record that typically matches the following structure:

```json
{
    "id": "1",
    "principal": "casuser",
    "service": "https://apereo.github.io",
    "createdDate": "2023-04-19T10:59:48.325412",
    "options": "ATTRIBUTE_NAME",
    "reminder": 30,
    "reminderTimeUnit": "DAYS",
    "attributes": "..."
}
```

As of this writing, there is no bulk import operation. You would need to invoke the above operation multiple times for the number of available records.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html