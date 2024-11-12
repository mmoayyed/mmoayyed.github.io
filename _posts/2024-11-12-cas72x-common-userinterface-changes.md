---
layout:     post
title:      Apereo CAS - User Interface Customizations
summary:    Learn how to handle a number of rather common customizations when it comes to changing the CAS user interface and themes.
tags:       ["CAS 7.2.x", "UI/UX"]
---

When it comes to implementing CAS user interface customizations, there are many options and strategies one can use to deliver a unique user experience. In this post, we will review a number of fairly common use cases when it comes to changing the CAS user interface to learn how to change styles, update themes, and more.

{% include googlead1.html  %}

This tutorial loosely requires and focuses on:

- CAS `7.2.x`
- Java `21`

# Use Cases

> How can I change the default CAS color scheme to match my own?
{% include googlead1.html  %}
This can be achieved with CSS only. You do not and should not have to copy down the `cas.css` file into your project. Rather, create a `src/main/resources/static/css/custom.css` and put **YOUR** override styles there. The contents of this file do override the default CSS styles and construct and you can freely tweak the page to match your colors and styles.

> How can I replace the CAS logo in the header with my own?
{% include googlead1.html  %}
You can either overwrite the logo file itself with yours at `src/main/resources/static/images/cas-logo.png` or in your theme file, specify the path to your logo. Create a `src/main/resources/cas-theme-custom.properties` and add the following line:

```properties
cas.logo.file=/images/my-logo.png
```

Your logo needs to be available at `src/main/resources/static/images`. 
{% include googlead1.html  %}
You can also style the logo `img` element with using the CSS selector `#cas-logo` in your CSS file or with a class CSS selector for `.cas-logo`.

> How can I remove the drawer menu from the header? 

This can be controlled with theme settings. Create a `src/main/resources/cas-theme-custom.properties` and add the following setting:
{% include googlead1.html  %}
```properties
cas.drawer-menu.enabled=false
```

> How can I change the text for the copyright in the footer?

You can override the language key for almost all elements in the CAS user interface. Create a `src/main/resources/custom_messages.properties` file and add the following line:
{% include googlead1.html  %}
```properties
copyright=This is my own copyright declaration
```

> How can I change the label for the username field?

Create a `src/main/resources/custom_messages.properties` file and add the following line:
{% include googlead1.html  %}
```properties
screen.welcome.label.netid=Username
```

> How can I hide the CAS version details in the footer?

This can be controlled with theme settings. Create a `src/main/resources/cas-theme-custom.properties` and add the following setting:
{% include googlead1.html  %}
```properties
cas.footer.show-version=false
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
