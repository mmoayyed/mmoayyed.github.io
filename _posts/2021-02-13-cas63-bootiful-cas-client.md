---
layout:     post
title:      Apereo CAS - Bootiful CASified Web Application
summary:    A review of a simple Spring Boot web application powered by Apereo CAS for authentication and single sign-on.
tags:       [CAS]
---

The `bootiful-cas-client` is a modest web application powered by Spring Boot, which relies on Apereo CAS for authentication and web single sign-on. In this walkthrough, we will take a quick look at the anatomy of the web application and attempt to integrate it with a given CAS server for fun and profit, etc. Mainly, etc.

{% include googlead1.html %}

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [Bootiful Java Web Application](https://github.com/apereo/bootiful-cas-client)

# Setup

Lucky for us, this application build is prepped with the `org.jasig.cas.client:cas-client-support-springboot` library. Underneath the covers, this library auto-configures the application context and the [Java CAS client library](https://apereo.github.io/cas/6.3.x/integration/CAS-Clients.html) to interact with a CAS server and handle matters of authentication, etc.

{% include googlead1.html %}

Much like any other Spring Boot application, the main configuration file for the web application can be found at `src/main/resources/application.yml`, and at a minimum, the following settings need to be updated:

```yaml
cas:
  # This is the address of the CAS server
  server-url-prefix: https://localhost:8143/cas
  server-login-url: https://localhost:8143/cas/login

  # This is the address of the web application
  client-host-url: https://localhost:8443
```

Of course, our application requires `https` as should any application that requires any sort of authentication. You can update the `src/main/resources/application.yml` file and point Spring Boot to your own local keystore and truststore:

```yaml
server:
  port: 8443
  ssl:
    enabled: true
    key-store: /Users/path/to/.keystore
    key-store-password: changeit
```

{% include googlead1.html %}

You can generate a self-signed certificate with your own generated keystore using:

```bash
keytool -genkey -alias cas -keyalg RSA -validity 999 \
    -keystore /Users/path/to/.keystore -ext san=dns:$REPLACE_WITH_FULL_MACHINE_NAME
```

The certificate exported out of your keystore needs to also be imported into the Java platform’s `cacerts`:

```bash
# Export the certificate into a file
keytool -export -file /etc/cas/config/cas.crt -keystore /Users/path/to/.keystore -alias cas

# Import the certificate into the global keystore
sudo keytool -import -file /etc/cas/config/cas.crt -alias cas -keystore $JAVA_HOME/lib/security/cacerts
```

...where `JAVA_HOME` is where you have the JDK installed.

Finally, to see additional log statements and observe the exchange between the application and the CAS server, use:

```yaml
logging.level:
    org.jasig.cas: DEBUG
```

## Deploy

To run the web application, use:

{% include googlead1.html %}

```bash
./gradlew clean bootRun
```

...and try to navigate to a protected area of the application that requires authentication: `https://localhost:8443/protected`. You should be redirected to the CAS server's login page and asked to authenticate. Once you have logged in, you should be able to see the payload and the response that is authorized for release to your application.

{% include image.html img="https://user-images.githubusercontent.com/1205228/108210198-79c91900-7140-11eb-8222-1571137dc124.png" 
width="80%" 
title="CAS Server validation response parsed by the Java CAS Client" %}

{% include googlead1.html %}

Of course, your logs should more or less demonstrate the same response:

```xml
DEBUG 14788 --- [nio-8444-exec-2] o.j.c.c.v.Cas30ServiceTicketValidator   : 
Server response: 
<cas:serviceResponse xmlns:cas='http://www.yale.edu/tp/cas'>
  <cas:authenticationSuccess>
    <cas:user>casuser</cas:user>
    <cas:attributes>
      <cas:isFromNewLogin>false</cas:isFromNewLogin>
      <cas:authenticationDate>2021-02-17T13:19:43.805809Z</cas:authenticationDate>
      <cas:successfulAuthenticationHandlers>Static Credentials</cas:successfulAuthenticationHandlers>
      <cas:cn>CAS</cas:cn>
      <cas:first-name>Apereo</cas:first-name>
      <cas:credentialType>UsernamePasswordCredential</cas:credentialType>
      <cas:uid>casuser</cas:uid>
      <cas:display-name>Apereo CAS</cas:display-name>
      <cas:authenticationMethod>Static Credentials</cas:authenticationMethod>
      <cas:longTermAuthenticationRequestTokenUsed>false</cas:longTermAuthenticationRequestTokenUsed>
      <cas:email>info@apereo.org</cas:email>
      <cas:last-name>CAS</cas:last-name>
      <cas:username>casuser</cas:username>
    </cas:attributes>
  </cas:authenticationSuccess>
</cas:serviceResponse>
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html