---
layout:     post
title:      Apereo CAS - Configuration Management with Google Cloud Secret Manager
summary:    Learn how to configure, secure and manage configuration properties of your Apereo CAS deployment with Google Cloud SecretManager and Spring Cloud GCP.
tags:       ["CAS 7.1.x", "Google Cloud", "Configuration Management"]
---

[Google Cloud Secret Manager](https://cloud.google.com/secret-manager) is a secure and convenient method for storing API keys, passwords, certificates, and other sensitive data. Apereo CAS is also able to use Google Cloud Secret Manager to locate properties and settings. In this tutorial, we will briefly look at the configuration options required to connect CAS with Google Cloud Secret Manager.

{% include googlead1.html %}

Our starting position is as follows:

- CAS `7.1.x`
- Java `21`

# Google Application Credentials

You will need to instruct Spring Cloud GCP to connect to Google Cloud. For a deployment that is not running in a GGP environment, this requires that you set up the following environment variable: 

```shell
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp.json
```
{% include googlead1.html %}
You can use the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to provide the location of a credential JSON file. This JSON file can be a credential configuration file.

You can provide user credentials by running the `gcloud auth application-default login` command. This command places a JSON file containing the credentials you provide (usually from your own Google Account) in a well-known location on your file system. The location depends on your operating system:

- Linux, macOS: `$HOME/.config/gcloud/application_default_credentials.json`
- Windows: `%APPDATA%\gcloud\application_default_credentials.json`

# CAS Configuration

Once you have the [right module](https://apereo.github.io/cas/7.1.x/configuration/Configuration-Server-Management-SpringCloud-GCP-SecretManager.html) in place, you may then instruct your CAS deployment to fetch secrets from Google Cloud Secret Manager and assign them to CAS settings. For example:
{% include googlead1.html %}
```properties
cas.tgc.crypto.encryption.key=${sm://my-encryption-key}
```

Note that the name of the secret can be of your choosing. The above format is the shortest form; we specify secret ID and use the default project and latest version of the secret.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html