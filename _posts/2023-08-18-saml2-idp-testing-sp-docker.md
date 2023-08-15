---
layout:     post
title:      Testing SAML2 Identity Providers
summary:    Learn how to configure and run SAML2 service providers with Docker and connect them to your SAML2 identity providers to test integrations and verify the correctness of functionality.
tags:       ["SAML2", "Docker"]
---

When installing a new SAML2 identity provider, it often proves helpful to test its functionality by connecting it to a SAML2 service provider and running end-to-end integration tests. There are several SAML2 service providers available online that offer this functionality and yet almost all of them tend to prove rather unstable or limiting when it comes to various features and use cases. An alternative approach for integration tests would be to stand up dedicated SAML2 service providers as Docker containers and gain direct control over the test environment.

{% include googlead1.html  %}

In this post, we will briefly review several SAML2 service providers that can be spawned and configured as Docker containers.

# Spring Security SAML

The Spring Security project used to offer a [SAML](https://github.com/spring-attic/spring-security-saml) extension that is accompanied by a sample web application. This extension prepares the example application with SAML2 Service Provider capabilities. While quite old and now archived as of this writing, this extension and its sample project may prove quite useful for basic integration tests, particularly those that focus on the SAML2 Web SSO profile.

You may run this SAML2 service provider as a Docker container:
{% include googlead1.html  %}
```bash
docker run -p 9876:9876 -p 8076:8076 \
  -it --rm --name=saml2-sp \
  -v /path/to/idp-metadata.xml:/sp-webapp/idp-metadata.xml \
  -v /path/to/your/keystore:/etc/cas/thekeystore \
  -e AUTHN_CONTEXT="${AUTHN_CONTEXT}" \
  -e SIGN_AUTHN_REQUESTS=${SIGN_AUTHN_REQUESTS} \
  -e ACS_URL="${ACS_URL}" \
  apereo/saml2-sp:latest
```

<div class="alert alert-info">
  <strong>Note</strong><br/>As you observe above, the Docker image is not offered by the Spring Security project. Rather, it is managed and maintained by the Apereo Foundation.
</div>

You will need to specify the path to your SAML2 identity provider and also supply a keystore that would then be used by the running container for HTTPS connections. When the container runs, you may access the service provider at `https://localhost:9876/sp`. The SAML2 service provider metadata is available at `http://localhost:8076/sp/saml/metadata` under the entity id `https://spring.io/security/saml-sp`.
{% include googlead1.html  %}
As the Docker command above shows, you may also specify a number of parameters to tune the service provider:

1. `AUTHN_CONTEXT` can be used to instruct the service provider to request a specific SAML2 authentication context, such as `https://refeds.org/profile/mfa`.
2. `SIGN_AUTHN_REQUESTS` instructs the service provider to sign all authentication requests sent to the identity provider.
3. `ACS_URL` controls the assertion consumer service URL that one may use in authentication requests to the identity provider.

# SimpleSAMLphp

[SimpleSAMLphp](https://simplesamlphp.org/) offers SAML2 service provider functionality and allows one to communicate and delegate authentication to a SAML2 identity provider. While the project itself does not offer an official Docker image, there are a few options available and put together by third parties:
{% include googlead1.html  %}
```bash
docker run --name=simplesamlphp-idp -p 9443:8080 \
  -e IDP_ENTITYID="${IDP_ENTITYID}" \
  -v /path/to/your/saml.crt:/var/www/simplesamlphp/cert/saml.crt \
  -v /path/to/your/saml.pem:/var/www/simplesamlphp/cert/saml.pem \
  -v /path/to/your/authsources.php:/var/www/simplesamlphp/config/authsources.php \
  -d kenchan0130/simplesamlphp
```

Your own `authsources.php` file will need to set up the service provider:
{% include googlead1.html  %}
```php
'default-sp' => [
  'saml:SP',
  'privatekey' => 'saml.pem',
  'certificate' => 'saml.crt',
  'idp' => getenv('IDP_ENTITYID'),
  'IsPassive' => (getenv('SP_PASSIVE_AUTHN') === 'true'),
  'discoURL' => null,
  'SingleLogoutServiceBinding' => [
    'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
    'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
  ]
]
```

Once the container is running, you may access the installation page via `http://localhost:9443/simplesaml/`. When you are ready, the SP-initiated authentication flow can be started with `http://localhost:9443/simplesaml/module.php/core/authenticate.php?as=default-sp`.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to engage and contribute as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)