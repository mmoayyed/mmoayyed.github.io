---
layout:     post
title:      Apereo CAS - User Interface Customizations
summary:    A review of Apereo CAS user interface customization strategies, including themes for those who enjoy front-end development and the wonderful world of UI/UX.
tags:       [CAS]
---

When it comes to implementing CAS user interface customizations, there are many options and strategies one can use to deliver a unique user experience. There are ways one can customize the default views to overlay changes on top of provided HTML files. These views may then be customized and loaded from a variety of locations, and just as well, could be themed using both static and dynamic strategies either globally or on a per-application basis. In this post, we shall review such customization strategies at a high-level, and also touch upon developer tools and methods that allow the changes to quickly go into effect and get deployed.

{% include googlead1.html %}

Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [CAS Initializr](https://apereo.github.io/cas/6.3.x/installation/WAR-Overlay-Initializr.html)

# Overlaying Views

CAS application views are found at `src/main/resources/templates` which is a location within the CAS web application itself. To modify the CAS HTML views, each view file first needs to be brought over into the overlay. You can use the `gradlew listTemplateViews` command to see what HTML views are available for customizations. Note that CAS views are broken up into smaller fragments, allowing you to customize and change specific portions of a particular page if needed. At any rate, once the file is chosen simply use `gradlew getResource -PresourceName=xyz` to bring the resource view into your overlay:

```bash
./gradlew getResource -PresourceName=footer.html

> Task :getResource
Copied file /cas-overlay/build/cas-resources/templates/fragments/footer.html 
    to src/main/resources/templates/fragments/footer.html

BUILD SUCCESSFUL in 16s
```

{% include googlead1.html %}

Now that you have the `footer.html` brought into the overlay, you can simply modify the file at `cas-overlay-template/src/main/resources/templates/fragments/footer.html` to introduce your footer-related changes, and then get the CAS web application deployed to finesse.

<div class="alert alert-info">
  <strong>Note</strong><br/>To see what other tasks are available with the build, use <code>gradlew tasks</code>.
</div>

# Deploying Views

The quickest way to test such changes is by using the `bootRun` command:

```bash
gradlew bootRun
```

This command simply runs the CAS web application in an isolated sandboxed mode where local resources such as HTML, CSS, Javascript, and other components are watched and reloaded dynamically when changes are detected. In our above example, you can continue to make changes to the `footer.html` file and keep refreshing the browser to see the change in action.

{% include googlead1.html %}

<div class="alert alert-success">
<strong>The CAS Watch</strong><br/>Files must exist in the overlay before they can be watched. If you add a new local resource into the overlay, you may need to run the <code>bootrun</code> command again so the file becomes watchable.
</div>

Note that view definitions and files are by default cached where the file content is processed and rendered once and then cached for maximum performance. If you wish for changes to be picked up automatically, you do need to disable the cache via the following setting in your `cas.properties` file:

```properties
spring.thymeleaf.cache=false
```

# Externalized Views

The location of view templates and HTML files can be externalized using the following strategies.

## Spring Boot

The location of CAS views is by default expected to be found at `src/main/resources/templates` which is the sort of behavior controlled and provided by Spring Boot. This location can be controlled using the following setting:

{% include googlead1.html %}

```properties
spring.thymeleaf.prefix=classpath:/templates/
```

This instructs CAS to locate views at the specified location. This location can be externalized to a directory outside the cas web application. Via this option, *all CAS views* are expected to be found at the specified location and there is no fallback strategy. (Note that multiple prefixes may be specified in comma-separated syntax).

## CAS

As a native CAS feature, Views and HTML files also may be externalized outside the web application conditionally and individually, provided the external path via CAS settings is defined. If a view template file is not found at the externalized path, the default one that ships with CAS will be used as the fallback.

```
cas.view.template-prefixes[0]=file:///etc/cas/templates
```

With the above setting, I can try the following command to let CAS pick up the `footer.html` file from the above location:

{% include googlead1.html %}

```
mv src/main/resources/templates/fragments /etc/cas/templates
```

Of course, changes should continue to get picked up and deployed dynamically just like before!

# Themes

CAS deployers are now able to switch the themes based on different services. For example, you may want to have different login screens (different styles) for staff applications and student applications. Or, you want to show two layouts for daytime and nighttime. This document could help you go through the basic settings to achieve this. Themes are generally defined statically either embedded with the CAS web application or externalized outside, and there are a number of strategies one can use to activate, trigger and switch to a theme.

## Static Themes

CAS is configured to decorate views based on the `theme` property of a given registered service in the Service Registry. The theme that is activated via this method will still preserve the default views for CAS but will simply apply decorations such as CSS and Javascript to the views. The physical structure of views cannot be modified via this method.

To achieve this, add a `dracula.properties` placed to the root of `src/main/resources` folder. Contents of this file should match the following:

```properties
cas.standard.css.file=/themes/dracula/css/cas.css
cas.javascript.file=/themes/dracula/js/cas.js
cas.admin.css.file=/themes/dracula/css/admin.css
```

{% include googlead1.html %}

Once you have created the above `/themes/dracula` directory structure with your CSS and Javascript files, activate the theme for a relevant application in the registry:

```json
{
  "@class" : "org.apereo.cas.services.RegexRegisteredService",
  "serviceId" : "https://app.example.org",
  "name" : "ApplicationName",
  "id" : 1001,
  "evaluationOrder" : 10,
  "theme": "dracula"
}
```

To see the theme in action, navigate to `https://sso.example.edu/cas/login?service=https://app.example.org`.

## Themed Views

CAS can also utilize a service’s associated `theme` property to selectively choose which set of UI views will be used to generate the standard views (i.e. `casLoginView.html`, etc). This is especially useful in cases where the set of pages for a theme that is targeted for a different type of audience are entirely different structurally, such that simply using a simple theme is not practical. So far, we have only seen basic CSS and Javascript files associated with a theme but what if you wanted the `dracula` theme activated for a service to present a different footer? Surely, the capabilities of a theme must go beyond CSS and Javascript, right? [Is that possible?](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/)

{% include googlead1.html %}

Yes. Views associated with a particular theme by default are expected to be found at `src/main/resources/templates/<theme-id>`. For example, in addition to the CSS and Javascript files for the `dracula` theme, you can clone the default set of CAS views into a new directory at `src/main/resources/templates/dracula`. When CAS begins to render the UI for `https://app.example.org`, it would then look inside `src/main/resources/templates/dracula` to find the requested view (i.e. `casLoginView.html`) allowing you to control the HTML view on a per-application basis. A themed view will only be used if and once found; otherwise, the defaults will continue to run as expected.

## Externalized Themes

Note that CAS views and theme-based views may both be externalized out of the web application context. When externalized, themed views are expected to be found at the specified path via CAS properties under a directory named after the theme name. For instance, if the external path for CAS views is `/etc/cas/templates`, view template files for theme `dracula` may be located at `/etc/cas/templates/dracula/`.

To externalize themes, you would start by relocating CAS templates and HTML files outside the web application just as you would with normal views:

```
cas.view.template-prefixes[0]=file:///etc/cas/templates

spring.resources.static-locations=classpath:/META-INF/resources/, \
  classpath:/resources/,classpath:/static/, \
  classpath:/public/,file:/etc/cas/templates/
```

{% include googlead1.html %}

Note the last setting which is quite important; it allows Spring Boot to examine `file:/etc/cas/templates/` to look for static resources. This will become important as we also begin to move CSS, Javascript, images, and other static resources outside the application.

The basic constructs of the theme are all the same; you would have a `dracula.properties` placed to the root of `src/main/resources` folder in the overlay just as before. Finally, the contents of `/etc/cas/templates` should match the following structure:

```
/etc/cas/templates/themes/dracula

── static
    ├── css
    │   └── cas.css
    └── js
        └── cas.js
```

...and just as before, you can navigate to `https://sso.example.edu/cas/login?service=https://app.example.org` to see the theme in action.

{% include googlead1.html %}

<div class="alert alert-info">
  <strong>Note</strong><br/>In CAS <code>6.4.x</code> with Spring Boot <code>2.4.x</code>, the setting to locate static resources is changed to <code>
spring.web.resources.static-locations</code>. Furthermore, specifying this setting in your CAS configuration should no longer be necessary.</div>

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html