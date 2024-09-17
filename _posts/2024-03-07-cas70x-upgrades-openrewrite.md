---
layout:     post
title:      Apereo CAS - Upgrade Recipes w/ OpenRewrite
summary:    Discover how to upgrade your CAS deployment quickly and efficiently by taking advantage of upgrade recipes and OpenRewrite.
tags:       ["CAS 7.0.x", "Getting Started"]
---

[OpenRewrite](https://docs.openrewrite.org/) is a tool and platform used by CAS and allows the project to upgrade installations in place from one version to the next. It works by making changes to the project structure representing your CAS Overlay build and printing the modified files back. Modification instructions are packaged together in form of upgrade scripts called Recipes that are produced by the CAS project, and then referenced and discovered in the CAS overlay.

{% include googlead1.html %}
In this post, we are going to take a brief look at what it takes to upgrade a CAS deployment using OpenRewrite. This tutorial specifically focuses on:

- CAS `7.1.x`
- Java `21`

# Upgrade Recipes

OpenRewrite recipes are produced by CAS itself and are essentially YAML files that make minimally invasive changes to your CAS build allowing you to upgrade from one version to the next with minimal effort. The recipe contains *almost everything* that is required for a CAS build system to navigate from one version to other and automates tedious aspects of the upgrade such as finding the correct versions of CAS, relevant libraries and plugins as well as any possible structural changes to one’s CAS build.
{% include googlead1.html %}
<div class="alert alert-warning">
  <strong>WATCH OUT!</strong><br/>While upgrades recipes will continue to get smarter and better over time, you should know that their technical prowess and ability can only go so far. There may be certain aspects of the upgrade that are simply not possible to automate, specially if you have made significant modifications to your CAS build.
</div>

# Upgrades

Let's suppose that your current [CAS deployment](https://apereo.github.io/cas/7.1.x/installation/WAR-Overlay-Installation.html) is based on `7.0.0` and you intend to upgrade to `7.0.2`. We begin by first verifying the base CAS version to confirm:
{% include googlead1.html %}
```bash
./gradlew casVersion --no-configuration-cache -q

7.0.0
```

Next, we can ask the build to discover and list all upgrade recipes that might be applicable for the task at hand:
{% include googlead1.html %}
```bash
./gradlew --init-script openrewrite.gradle rewriteDiscover \
    -PtargetVersion=7.0.2 --no-configuration-cache | grep "org.apereo.cas"

org.apereo.cas.cas701
org.apereo.cas.cas700
org.apereo.cas.cas702
```

The output above shows the list of upgrade recipes that are available, if we were to switch to a target version of `7.0.2`.

Next, we can dry-run our selected recipe, `org.apereo.cas.cas702`, and see which files would be changed in the build log. This does not alter your source files on disk at all. This goal can be used to preview the changes that would be made by the active recipes.
{% include googlead1.html %}
```bash
./gradlew --init-script openrewrite.gradle rewriteDryRun \
    -PtargetVersion=7.0.2 -DactiveRecipe="org.apereo.cas.cas702" \
    --no-configuration-cache
```

The output will show how the build would be affected by the upgrade:
{% include googlead1.html %}
```
These recipes would make changes to gradle.properties:
    org.apereo.cas.cas702
        {key=cas.version, value=7.0.2, overwrite=true, filePattern=gradle.properties}
        {key=version, value=7.0.2, overwrite=true, filePattern=gradle.properties}
        {key=tomcatVersion, value=10.1.19, overwrite=false, filePattern=gradle.properties}
Report available:
    /path/to/build/reports/rewrite/rewrite.patch
```

You can in fact examine the generated `.patch` file:
{% include googlead1.html %}
```patch
diff --git a/gradle.properties b/gradle.properties
index ad0a33e..62fcb93 100644
--- a/gradle.properties
+++ b/gradle.properties
@@ -1,7 +1,7 @@ org.openrewrite.config.CompositeRecipe

-version=7.0.0
+version=7.0.2
 # CAS server version
-cas.version=7.0.0
+cas.version=7.0.2

springBootVersion=3.2.1

@@ -70,3 +70,4 @@
+tomcatVersion=10.1.19
```

When you are ready, you can run the actual recipe:
{% include googlead1.html %}
```bash
./gradlew --init-script openrewrite.gradle rewriteRun \
    -PtargetVersion=7.0.2 -DactiveRecipe="org.apereo.cas.cas702" \
    --no-configuration-cache
```

This will run the selected recipes and apply the changes. This will write changes locally to your source files on disk. Afterward, review the changes, and when you are comfortable with the changes, commit them. You can examine the changes via:
{% include googlead1.html %}
```bash
git diff
```

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)
