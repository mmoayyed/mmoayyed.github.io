---
layout:     post
title:      Apereo CAS - OpenID Connect JWKS with Spring Cloud GCP and Secret Manager
summary:    Learn how to configure, secure and manage the OpenID Connect JWKS of your Apereo CAS deployment with Google Cloud SecretManager and Spring Cloud GCP.
tags:       ["CAS 7.0.x", "Google Cloud", "Configuration Management"]
---

[Google Cloud Secret Manager](https://cloud.google.com/secret-manager) is a secure and convenient method for storing API keys, passwords, certificates, and other sensitive data. Apereo CAS is also able to use Google Cloud Secret Manager to locate properties and settings. In this tutorial, we will briefly look at the configuration options required to connect CAS with Google Cloud Secret Manager.

{% include googlead1.html %}

Our starting position is as follows:

- CAS `7.0.x`
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

Once you have the [right module](https://apereo.github.io/cas/development/configuration/Configuration-Server-Management-SpringCloud-GCP-SecretManager.html) in place, you may then instruct your CAS deployment to fetch secrets from Google Cloud Secret Manager and assign them to CAS settings. For example:
{% include googlead1.html %}
```properties
cas.authn.oidc.jwks.file-system.jwks-file=${sm://cas_authn_oidc_jwks_file-system_jwks-file}
```

Note that the name of the secret can be of your choosing. In this case, the secret value assigned to `cas_authn_oidc_jwks_file-system_jwks-file` may be the raw contents of the JWKS file required by OpenID Connect:

```json
{ "keys": [] }
```

# CAS Encrypted JWKS

Another strategy for managing the JWKS would be to use CAS configuration security to encrypt the file. You can take advantage of built-in [Jasypt functionality](http://www.jasypt.org/) to decrypt sensitive CAS settings. Jasypt supplies command-line tools useful for performing encryption, decryption, etc. To use the tools, you should download the Jasypt distribution. Once unzipped, you will find a `jasypt-$VERSION/bin` directory with several bat|sh scripts that you can use for encryption/decryption operations `(encrypt|decrypt).(bat|sh)`.
{% include googlead1.html %}
You may also use the [CAS Command-line Shell](https://apereo.github.io/cas/development/installation/Configuring-Commandline-Shell.html) to encrypt settings. The `encrypt-value` command does accept a `--file` parameter that you can use along with the encryption password to encrypt the contents of the JWKS file. 

Once you have the contents of the JWKS encrypted, you can pass the encrypted file to CAS:

```properties
cas.authn.oidc.jwks.file-system.jwks-file=/path/to/encrypted.jwks
```

The encrypted keystore will look similar to the following:
{% include googlead1.html %}
```
{cas-cipher}pbmmaBoWgFqCoEDY+kiuBKGc0wmovW....
```

The `{cas-cipher}` prefix tells CAS that this value should be decrypted before usage. 

You also need to instruct CAS to use the proper algorithm, decryption key, and other relevant parameters when attempting to decrypt settings. Typically this means instructing CAS to load the decryption key early on during the bootstrapping phase of the application via a system property or environment variable. For example, doing this with a system property would be similar to the following:

```
-Dcas.standalone.configuration-security.psw=<DECRYPTION_PASSWORD>
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html