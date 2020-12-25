---
layout:     post
title:      Apereo CAS - Securing PHP with OpenID Connect
summary:    Learn how to secure a simple PHP application using OpenID Connect code flow and Apereo CAS as an OpenID Connect identity provider.
tags:       [CAS]
---

This blog post demonstrates how to set up a basic PHP application to authenticate and authorize using OpenID Connect Code flow. The [PHP OpenID Connect Client](https://github.com/jumbojett/OpenID-Connect-PHP) is used to implement the client-side authentication and validation logic and the Apereo CAS server is used to act as an OpenID Connect identity provider.


{% include googlead1.html  %}

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- PHP `7` or later
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)
- [PHP OpenID Connect Basic Client](https://github.com/jumbojett/OpenID-Connect-PHP)

## CAS Configuration

Once you have the correct modules in the WAR overlay for [OpenID Connect](https://apereo.github.io/cas/development/installation/OIDC-Authentication.html), you will need to make sure the client application is [registered with CAS](https://apereo.github.io/cas/6.2.x/services/JSON-Service-Management.html) as a relying party:

```json
{
  "@class": "org.apereo.cas.services.OidcRegisteredService",
  "clientId": "client",
  "clientSecret": "secret",
  "serviceId": "^http://localhost.*",
  "name": "OIDC",
  "id": 1,
  "scopes" : [ "java.util.HashSet", [ "profile", "openid", "email" ] ]
}
```


## PHP Client Application

The [PHP OpenID Connect Basic Client](https://github.com/jumbojett/OpenID-Connect-PHP) is a PHP library that allows an application to authenticate a user through the basic OpenID Connect flow. We can use [Composer](https://getcomposer.org/download/), a dependency manager for PHP, to pull down the library and make it available to our application:

```bash
composer require jumbojett/openid-connect-php    
```

The typical PHP setup in a `client.php` file is as follows:

{% include googlead1.html  %}

```php
<?php
require __DIR__ . '/vendor/autoload.php';
use Jumbojett\OpenIDConnectClient;
$oidc = new OpenIDConnectClient(
    'https://sso.example.org/cas/oidc/',
    'client',
    'secret'
);
$oidc->addScope('email');
$oidc->setRedirectURL("http://localhost:8000/client.php");
$oidc->authenticate();
$name = $oidc->requestUserInfo('email');
?>
```

If the identity provider is sitting behind self-signed certificates, the following instructions can be used temporarily to disable TLS-related checks before authentication:

```php
$oidc->setVerifyHost(false);
$oidc->setVerifyPeer(false);
```

At the end of the OpenID Connect exchange, the `email` claim value is stored in a `name` variable that can be used in the HTML markup:

```php
 <p>Hello, <?php echo $name; ?></p>
 ```

To help with the testing process, the client application can be run using the PHP embedded web server:

```bash
php -S localhost:8000
```

## Testing

We can start the process by presenting a welcome screen to the user:

{% include image.html img="https://user-images.githubusercontent.com/1205228/102709115-8b1ab400-42bc-11eb-9416-cf8f25829036.png" width="80%" title="PHP Client Application Home Page" %}

Once we begin the process, the authentication flow will redirect the browser to CAS. After a successful authentication attempt, w are asked to consent to the release of the requested scopes and claims:

{% include googlead1.html  %}

{% include image.html img="https://user-images.githubusercontent.com/1205228/102709189-45aab680-42bd-11eb-8fc2-460b885eb966.png" width="60%" title="Apereo CAS OpenID Connect Consent" %}

Finally, our client application can ultimately ask for the `email` claim, and be granted its value as part of the authenticated user's profile:

{% include image.html img="https://user-images.githubusercontent.com/1205228/102709264-27918600-42be-11eb-9651-a7b36cc9f72f.png" width="60%" title="Apereo CAS OpenID Connect Successful Authentication" %}

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html