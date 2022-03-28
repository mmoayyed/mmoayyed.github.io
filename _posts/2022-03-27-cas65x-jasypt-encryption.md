---
layout:     post
title:      Apereo CAS - Configuration Security with Jasypt
summary:    Learn how to secure CAS configuration settings and properties with Jasypt.
tags:       ["CAS 6.5.x", "Jasypt", "Configuration Management"]
---

If you are running CAS in standalone mode without the presence of the Spring Cloud configuration server, you can take advantage of built-in [Jasypt functionality](http://www.jasypt.org/) to decrypt sensitive CAS settings.

Jasypt is a java library which allows the deployer to add basic encryption capabilities to CAS. Jasypt supplies command-line tools useful for performing encryption, decryption, etc. In order to use the tools, you may download the Jasypt distribution. Once unzipped, you will find a `jasypt-$VERSION/bin` directory a number of `bat|sh` scripts that you can use for encryption/decryption operations `(encrypt|decrypt).(bat|sh)`.

{% include googlead1.html  %}

However, an easier approach might be to use the native [CAS command-line shell](https://apereo.github.io/cas/6.5.x/installation/Configuring-Commandline-Shell.html). The CAS command-line shell provides the ability to query the CAS server for help on available settings/modules and various other utility functions one of which is the ability to encrypt and/or decrypt settings via Jasypt. We'll use the shell to encrypt a few settings and place them in your CAS configuration file, expecting the server to decrypt and use them as needed.
{% include googlead1.html  %}
Our starting position is based on:

- CAS `6.5.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Configuration

The [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template) presents a few instructions on how to download and run the shell. Once you're in, you can take advantage of the following Jasypt-related commands:

```bash
help encrypt-value
...
help decrypt-value
```
{% include googlead1.html  %}
So let's encrypt a setting:

```bash
cas>encrypt-value value casuser::Misagh alg PBEWithMD5AndTripleDES \
    provider SunJCE password ThisIsMyEncryptionKey iterations 1000

==== Encrypted Value ====
{cas-cipher}mMcg02NysblAcwYI+bFRpEcHBQaVQ51J
```

Nice. Let's verify that it can be decrypted back:
{% include googlead1.html  %}
```bash
cas>decrypt-value value {cas-cipher}mMcg02NysblAcwYI+bFRpEcHBQaVQ51J \
    alg PBEWithMD5AndTripleDES provider SunJCE \
    password ThisIsMyEncryptionKey iterations 1000

==== Decrypted Value ====
casuser::Misagh
```

Next, let's use our typical `cas.properties` file with the encrypted value:
{% include googlead1.html  %}
```properties
cas.authn.accept.users={cas-cipher}mMcg02NysblAcwYI+bFRpEcHBQaVQ51J
```

Almost there...the last task is to instruct CAS to use the proper algorithm, decryption key, and other relevant parameters when attempting to decrypt settings.

```properties
# cas.standalone.configuration-security.alg=PBEWithMD5AndTripleDES
# cas.standalone.configuration-security.provider=SunJCE
# cas.standalone.configuration-security.iterations=1000
# cas.standalone.configuration-security.psw=ThisIsMyEncryptionKey
```
{% include googlead1.html  %}

The above settings **MUST** be passed to CAS at runtime using either OS environment variables,
system properties or normal command-line arguments. For example, you may run CAS with an embedded servlet container while passing parameters as command-line arguments:

```bash
java -jar -Dlog.console.stacktraces=true \
    build/libs/cas.war \
    --cas.standalone.configuration-security.alg=PBEWithMD5AndTripleDES \
    --cas.standalone.configuration-security.provider=SunJCE \
    --cas.standalone.configuration-security.iterations=1000 \
    --cas.standalone.configuration-security.psw=ThisIsMyEncryptionKey \
    --logging.level.org.apereo.cas=trace
```

# More...

The shell also presents a few more Jasypt-related commands to list out algorithms, providers, etc. If you use the `help` command, you'd be presented with a list of available commands some of which are the following:
{% include googlead1.html  %}
```bash
cas>help jasypt-list-algorithms
...
cas>help jasypt-list-providers
...
cas>help jasypt-test-algorithms
...
```


## Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
