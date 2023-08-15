---
layout:     post
title:      Apereo CAS - Configuration Management with Azure Key Vault
summary:    Learn how to use Azure Key Vault in CAS to secure sensitive configuration data and retrieve configuration properties.
tags:       ["CAS 7.0.x", "Configuration Management", "Spring Boot", "Spring Cloud"]
---

Azure Key Vault provides secure storage of generic secrets, such as passwords and database connection strings. Apereo CAS deployments can integrate with Azure Key Vault as a regular property source to read secrets and properties before CAS starts. 

{% include googlead1.html %}

This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

Once you have prepared your CAS build with the appropriate extension module, you will need to place the following properties inside a `bootstrap.properties` or `bootstrap.yaml` file:

```yaml
spring:
  cloud:
    azure:
      keyvault:
        secret:
          property-source-enabled: true
          property-sources:
            - name: CasConfiguration
              endpoint: https://my.vault.azure.net
              credential:
                client-secret: ...
                client-id: ...
              profile:
                tenant-id: ...
                subscription-id: ...
```
{% include googlead1.html %}
In the same section, you can also control some advanced settings such as retry options and connection timeouts:

```yaml
spring:
  cloud:
    azure:
      keyvault:
        secret:
          property-source-enabled: true
          property-sources:
            - name: CasConfiguration
              retry:
                fixed:
                  delay: PT1S
                  max-retries: 5
                mode: FIXED
              client:
                response-timeout: PT2S
                write-timeout: PT2S
                connect-timeout: PT2S
                read-timeout: PT2S
```

That should be it. Now, you can begin configuring your Azure Key Vault instance with CAS secrets:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/230883237-95784eb7-8bae-4429-9775-9ae9cb5deff1.png"
width="50%" title="Apereo CAS integration with Azure Key Vault" %}

# Troubleshooting

Troubleshooting configuration and runtime issues can be especially tricky. Due to the way Spring Cloud property sources load during the very initial bootstrapping phase, connection or configuration problems often tend to be invisible, not logged, and cause the application to crash without any clues. You may need to stand up a debugger and trace the application execution to determine the root cause.

The following problems are however easy to diagnose and solve:

## Invalid Client Secret

You might run into the following error:

```
AADSTS7000215: Invalid client secret provided. Ensure the secret being sent in the request 
is the client secret value, not the client secret ID, for a secret added to app '...'.
```

This is a configuration mistake and has to do with the fact that the `client-secret` does not point to a secret, but to a secret identifier. You need to make sure the correct secret value is defined:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/230882956-7ae39c65-5239-4997-a0e2-ca9594d78b1e.png"
width="50%" title="Apereo CAS integration with Azure Key Vault" %}

## Access Denied

You might run into the following error:

```
The user, group or application '...' does not have secrets list permission on key vault '...'
```

This error indicates that the account used to authenticate into Azure Key Vault does not have the necessary permissions to interact with the service and list/read secrets. To remedy this, you need to ensure the service account or credential that is used to connect to Azure Key Vault has the right permissions and is assigned the correct access policy:
{% include googlead1.html %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/230883761-22a13226-30dd-446e-b8de-d13e765939de.png"
width="50%" title="Apereo CAS integration with Azure Key Vault" %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html