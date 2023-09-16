---
layout:     post
title:      Keycloak - Authentication & User Federation
summary:    Learn how to customize Keycloak to build your authentication strategy using Keycloak's user federation features.
tags:       ["Keycloak"]
---

[Keycloak](https://www.keycloak.org/) is an open-source IAM solution that provides user federation, strong authentication, user management, and much more. As a single sign-on provider, it allows users to authenticate via external identity sources such as LDAP or Active Directory services that store user and credential information. You can point Keycloak to validate credentials from those external stores and pull in identity information.

{% include googlead1.html  %}

In this post, we will look at options provided by Keycloak that allow a server developer to build their own authentication strategy by extending Keycloak's user federation APIs. Our starting position is:

- Keycloak `22`
- Java `17`

# Overview

You can use Keycloak's *User Storage SPI* to write extensions to Keycloak to connect to external user databases and credential stores. Organizations often have existing external proprietary user databases that they cannot migrate to Keycloak’s data model and application developers then need to write implementations of the User Storage SPI to bridge the external user store and the internal user object model that Keycloak uses to log in users and manage them.

<div class="alert alert-info">
  <strong>SPI What?</strong><br/>SPI is a design pattern and a mechanism, typically in Java, for allowing third-party extensions or plugins to be easily integrated into a Java application without modifying its core code. SPI is commonly used in libraries and frameworks to provide a way for developers to extend or customize the behavior of the library without having to modify its source code. Keycloak has a number of Service Provider Interfaces (SPI) for which you can implement your own providers to customize functionality and extend behavior.
</div>
{% include googlead1.html  %}
When the Keycloak runtime needs to look up a user, such as when a user is logging in, it performs a number of steps to locate the user. It first looks to see if the user is in the user cache; if the user is found it uses that in-memory representation. Then it looks for the user within the Keycloak local database. If the user is not found, it then loops through User Storage SPI provider implementations to perform the user query until one of them returns the user the runtime is looking for. 

Note that User Storage SPI provider implementations are not enabled by default, but instead must be enabled and configured per realm under the User Federation tab in the administration console.

# User Storage Provider

To extend parts of Keycloak, one has to register custom implementations of Keycloak Service Provider Interfaces (SPIs). In our case, we will need to implement the `org.keycloak.storage.UserStorageProviderFactory` and register it with the Java Service Loader API. This factory is then tasked to supply an implementation of the `UserStorageProvider` that selects and delivers the final user to Keycloak.

So, let's start with our factory implementation:
{% include googlead1.html  %}
```java
package org.example.keycloak;

public class MyUserStorageProviderFactory 
    implements UserStorageProviderFactory<MyUserStorageProvider> {

    private MyAuthenticationClient client;

    @Override
    public void init(final Config.Scope config) {
        client = new MyAuthenticationClient(...);
    }

    @Override
    public MyUserStorageProvider create(KeycloakSession keycloakSession, 
                                        ComponentModel componentModel) {
        return new MyUserStorageProvider(keycloakSession, componentModel, client);
    }

    @Override
    public String getId() {
        return "my-user-storage";
    }

    @Override
    public String getHelpText() {
        return "My User Storage Provider";
    }
}
```

...and then, our own `MyUserStorageProvider` implementation:
{% include googlead1.html  %}
```java
public class MyUserStorageProvider implements UserStorageProvider {
}
```

Keycloak also providers a number of additional *Provider* implementation that you may choose to implement to assist with various CRUD and password operations:

- `UserLookupProvider`
- `CredentialInputValidator`
- `CredentialInputUpdater`
- `UserQueryProvider`

Next, we need to register our factory implementation inside the file `META-INF/services/org.keycloak.storage.UserStorageProviderFactory`:
{% include googlead1.html  %}
```
org.example.keycloak.MyUserStorageProviderFactory
```

# Registering User Storage Providers

As discussed before, User Storage SPI provider implementations are not enabled by default, but instead must be enabled and configured per realm under the User Federation tab in the administration console. This can be done with the following steps:
{% include googlead1.html  %}
- Select "User Federation" in the menu column
- Select your provider in the listbox that shows "Add provider..."
- Click "Save" on the "Add User Federation Provider" screen.

...and you're done!

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to engage and contribute as best as you can.

[Misagh Moayyed](https://fawnoos.com)
