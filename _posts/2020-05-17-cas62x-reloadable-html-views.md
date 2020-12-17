---
layout:     post
title:      Apereo CAS - Reloading HTML Views
summary:    Learn how to make changes to Apereo CAS HTML views and have them be reloaded dynamically at runtime without restarts or rebuilds.
published: true
tags:       [CAS]
---

One of the more common customizations tasks in an Apereo CAS deployment is the branding and decoration of the HTML views presented to the user for login, logout, etc. These views in Apereo CAS are backed by the [Thymeleaf templating engine](https://www.thymeleaf.org/) and are embedded in the CAS web application archive. For customizations, the goal is to extract these views and bundles from the CAS web application archive, (as prepared and built via the installation overlay), make changes as necessary, and then refresh the browser to see the effects live without restarts or rebuilds.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

Our starting position is based on:

- CAS `6.2.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# HTML Templates

When you have a functioning CAS environment via the WAR overlay, the first thing you want to is to get a report of all tasks available so that you get familiar with the tooling made available for you:

```bash
./gradlew tasks
```

...or if want to narrow down the task list to a specific group:

```bash
./gradlew tasks --group CAS
```

This should present you with the following output:

```
CAS tasks
---------
casVersion - Display the current CAS version
copyCasConfiguration - Copy the CAS configuration from this project to /etc/cas/config
createKeystore - Create CAS keystore
debug - Debug the CAS web application in embedded mode on port 5005
executable - Run the CAS web application in standalone executable mode
explodeWar - Explodes the CAS archive and resources jar from the CAS web application archive
explodeWarOnly - Explodes the CAS web application archive
exportConfigMetadata - Export collection of CAS properties
getResource - Fetch a CAS resource and move it into the overlay
listTemplateViews - List all CAS views
setExecutable - Configure the project to run in executable mode
showConfiguration - Show configurations for each dependency, etc
```

In the above list, the task to take note of is the following:

```bash
./gradlew listTemplateViews | more
```

This should present to you every template view file that is available to CAS by default, ready for customizations. If you examine the setup, you will find that all such views are buried and embedded in a `org.apereo.cas:cas-server-support-thymeleaf` module that the build attempts to unpack and examine to display the possibilities. 

# Fetching Template Views

To customize a view, we first need to bring the file into our setup and *overlay* it on top of the original. To do so and taking inspiration from the above task list, we may try the following:

```bash
./gradlew getResource -PresourceName=casLoginView.html
```

The output of the above command should indicate that `casLoginView.html` was fetched and copied to the appropriate location in the overlay. You can now begin to customize the page as necessary and examine the changes in the browser with a running CAS server.

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

# Reloading HTML Changes

The WAR overlay is equipped with the Spring Boot Gradle plugin allowing you to take advantage of the `bootRun` task. This task is specifically customized in the overlay to bring up CAS in an embedded Apache Tomcat container and to activate [Spring Boot Developer Tools](https://docs.spring.io/spring-boot/docs/current/reference/html/using-spring-boot.html#using-boot-devtools), whose one of the key features is to watch classpath resources for changes and refresh and *restart* the application context somewhat invisibly to allow the possibility of dynamic reloads. 

<div class="alert alert-info">
  <strong>WAR Overlays</strong><br/>Note that Spring Boot and its developer tooling were not specifically designed to handle WAR overlays and do not officially advertise support for such deployment types. Thus, certain corner cases or advanced scenarios with developer tooling and dynamic reloads may not be immediately possible. YMMV.
</div>

So as an example, let's walk through a scenario. First, let's run CAS:

```bash
./gradlew bootRun
```

When the system is up and running, navigate to your copy of `casLoginView.html` and make a few changes. When done and while CAS is still running, switch to your browser and refresh the page to review the CAS login page. Your changes should be there!

# Views vs. Fragments

Some HTML templates and views in CAS import bits and pieces of HTML *fragments* to maximize reusability, such as the header fragment present on all pages using a `header.html` fragment. There is also a general layout, `layout.html` for all template views that outlines the page skeleton consistently and globally. All such fragments and layouts are also candidates for customization as well as dynamic reloads. 

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

They can be brought into the overlay in much the same way:

```bash
./gradlew getResource -PresourceName=header.html
./gradlew getResource -PresourceName=layout.html
```
 
Just like before, changes should be refreshed and viewable in the browser as you make changes to the underlying files.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)