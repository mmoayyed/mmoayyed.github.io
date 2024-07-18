---
layout:     post
title:      Working with Java Keystores, keytool and OpenSSL
summary:    A few tips and commands to use with OpenSSL and Java's keytool command to convert, manage, and import/export keystores.
tags: ["Miscellaneous"]
---

If you often find yourself having to deal with a Java keystore using the `keytool` command, this post is for you. I'll briefly go over a number of commands and options that have helped me over the years to export, search and convert keys from one format to another ultimately to import into a destination keystore. 

{% include googlead1.html  %}

Here we go. 

# Tooling

The Java `keytool`, typically found in `$JAVA_HOME/bin` directory, is a command-line utility that is used to manage keys and certificates in Java keystores. It can generate, import, and export cryptographic keys and certificates. For many common key-related operations, you also need to have `openssl` at your disposal. OpenSSL is a toolkit that implements the SSL and TLS protocols and generally work as a general-purpose cryptography library and has the ability to convert keys and keystores from one format to another. 
{% include googlead1.html  %}
Let's go over a few sample commands that you might useful using the above tools.

# Commands

Let's start with generating our very own keystore:
{% include googlead1.html  %}
```bash
keytool -genkey -alias myentry -keyalg RSA -validity 999 \
    -keystore /etc/config/thekeystore -ext san=dns:$REPLACE_WITH_FULL_MACHINE_NAME
```

This will generate a `thekeystore` file which will include the SSL private/public keys that are issued for your server domain. Make sure you replace `$REPLACE_WITH_FULL_MACHINE_NAME` with a real value, such as `myserver.example.org`, if that is where your certificate would be used.

The above commands usually starts out with the following response:
{% include googlead1.html  %}
```
Enter keystore password: changeit
Re-enter new password: changeit
What is your first and last name?
  [Unknown]:  $REPLACE_WITH_FULL_MACHINE_NAME (i.e. mymachine.domain.edu)
What is the name of your organizational unit?
  [Unknown]:  Test
What is the name of your organization?
  [Unknown]:  Test
What is the name of your City or Locality?
  [Unknown]:  Test
What is the name of your State or Province?
  [Unknown]:  Test
What is the two-letter country code for this unit?
  [Unknown]:  US
Is CN=$FULL_MACHINE_NAME, OU=Test, O=Test, L=Test, ST=Test, C=US correct?
  [no]:  yes
  ```

<div class="alert alert-info">
  <strong>Remember</strong><br/>When the question asks for your first name or last name, do not take it personally. You should still specify the full machine name, as it's shown in the above example.
</div>

Next, you can use the `keytool` command to list the entries in your keystore:
{% include googlead1.html  %}
```bash
# This will ask you for a password...
keytool -list -keystore /etc/config/thekeystore 
```

...and you can of course delete entries by their alias:

```bash
# This will ask you for a password...
keytool -delete -alias myentry -keystore /etc/config/thekeystore 
```

You can also export the certificate or public entry attached to your key in the keystore:
{% include googlead1.html  %}
```bash
keytool -export -file /etc/config/mycertificate.crt \
  -keystore /etc/config/thekeystore -alias myentry
```

<div class="alert alert-info">
  <strong>Remember</strong><br/>Names do not matter. You can name your keystore anything you prefer with any extension, and when you import or export files, they can also be named anything you prefer. Content is important, not appearances.
</div>

Now let's say you have a private/public keypair in PEM format and you want to get those into a Java keystore. A PEM file is used to store and transmit cryptographic keys, certificates, and other data and it is a Base64 encoded format with specific headers and footers. Being in Base64 encoding makes it easy to read in text editors.

To get our PEM files into a Java keystore, we first need `openssl` to convert them into a compatible format such as `PKCS12`:
{% include googlead1.html  %}
```bash
openssl pkcs12 -export -in /etc/config/cert.pem \
  -inkey /etc/config/key.pem -out /etc/config/keystore.p12 -name myentry
```

When you have the `keystore.p12` file, you can import it into your own Java keystore:
{% include googlead1.html  %}
```bash
keytool -importkeystore -deststorepass changeit -destkeypass changeit \
  -destkeystore /etc/config/thekeystore -srckeystore /etc/config/keystore.p12 \
  -srcstoretype PKCS12 -srcstorepass changeit -alias myentry
```

That's it. If you master the above commands, you'll keep out of trouble most of the time!

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)