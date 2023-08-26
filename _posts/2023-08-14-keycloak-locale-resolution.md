---
layout:     post
title:      Keycloak - Customizing Locale Resolution Rules
summary:    Learn how to customize Keycloak to build your own locale resolution rules for login forms and theme templates.
tags:       ["Keycloak"]
---

[Keycloak](https://www.keycloak.org/) is an open-source IAM solution that provides user federation, strong authentication, user management, and much more. As a single sign-on provider, it allows users to authenticate with Keycloak rather than individual applications via dedicated login forms. Such forms are often internationalized and require different layouts and language bundles to render properly, and Keycloak allows one to customize the locale selection and resolution rules as necessary.

{% include googlead1.html  %}

In this post, we will look at options provided by Keycloak that allow a server developer to customize the locale resolution rules for various freemarker templates and HTML forms. Our starting position is as follows:

- Keycloak `22`
- Java `17`

# Locale Selection Rules

Keycloak documentation indicates that the default locale is English with the internationalization setting disabled. When this option is enabled, the locale is resolved according to the following logic:

- User selected - when the user has selected a locale using the drop-down locale selector.
- User profile - when there is an authenticated user and the user has a preferred locale set.
{% include googlead1.html  %}
- Client selected - passed by the client using for example `ui_locales` parameter.
- Cookie - the last locale selected on the browser.
- Accepted language - locale from `Accept-Language` header
- Realm default

If none of the above, fall back to English.

If the above selection does not immediately meet your needs, Keycloak also allows one to provide their locale selection logic via a dedicated implementation of the `LocaleSelectorProvider` interface. These implementations can extend the `DefaultLocaleSelectorProvider` to reuse, ignore or enhance parts of the default behavior. 

# Custom Locale Selection

To extend parts of Keycloak, one has to register custom implementations of Keycloak Service Provider Interfaces (SPIs). In our case, we will need to implement the `org.keycloak.locale.LocaleSelectorProviderFactory` and register it with the Java Service Loader API. This factory is then tasked to supply an implementation of the `LocaleSelectorProvider` that selects and delivers the final locale to Keycloak.

So, let's start with our factory implementation:
{% include googlead1.html  %}
```java
package org.example.keycloak;

public class MyLocaleSelectorProviderFactory 
  extends DefaultLocaleSelectorProviderFactory {

  @Override    
  public LocaleSelectorProvider create(KeycloakSession session) {
    return new MyLocaleSelectorProvider(session);    
  }

  @Override    
  public String getId() {
    return "MyLocale";
  }
}
```

...and then, our own `MyLocaleSelectorProvider` implementation:
{% include googlead1.html  %}
```java
public class MyLocaleSelectorProvider extends DefaultLocaleSelectorProvider {
  @Override
  public Locale resolveLocale(RealmModel realm, UserModel user) {
    // Stuff happens...
    return ...;
  }
}
```

Next, we need to register our factory implementation inside the file `META-INF/services/org.keycloak.locale.LocaleSelectorProviderFactory`:
{% include googlead1.html  %}
```
org.example.keycloak.MyLocaleSelectorProviderFactory
```

At this point, Keycloak has access to multiple options for selecting and loading locales. Ours, and what ships by default. So, we will need to instruct Keycloak to use our version of the locale selection rules and skip the default:
{% include googlead1.html  %}
```bash
/path/to/keycloak/bin/kc.sh --build --spi-locale-selector-provider=MyLocale
```

The SPI identifier, `MyLocale`, represents the identifier of the factory implementation as stated by the `getId()` method.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to engage and contribute as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)