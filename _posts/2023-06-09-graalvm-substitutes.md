---
layout:     post
title:      Graal VM - Substitute Incompatible Code in Native Image AOT Compilation
summary:    Learn how to design and build GraalVM substitutions and review the compilation of not-compatible Java code with Graal VM’s native image AOT compilation.
tags:       ["Graal VM", "Miscellaneous"]
---

Graal VM’s AOT compilation invokes the native-image executable at build time to run all execution paths starting from the application's entry point. While this works for simpler applications, from time to time, you will run into projects and code that prove incompatible with the native image tooling and need small tweaks. In this post, we will take a look at Substitutions in Graal VM and how incompatible code can be replaced at AOT build time.

{% include googlead1.html %}

This post specifically requires and focuses on:

- GraalVM `22.3.x`
- Java 17

# The Problem

For this exercise, I am going to focus on [Apache Xerces](https://xerces.apache.org/xerces2-j/), which provides high-performance, fully compliant XML parsers in the Apache Xerces family. If your project is a consumer of the *xercesImpl* library, (or does anything with XML parsing or the SAML2 protocol), you might receive the following error when you build and try to launch a native image with Graal VM:
{% include googlead1.html  %}
```
Caused by: java.lang.RuntimeException: internal error
    at org.apache.xerces.impl.dv.xs.XSSimpleTypeDecl.applyFacets1(Unknown Source)
    at org.apache.xerces.impl.dv.xs.BaseSchemaDVFactory.createBuiltInTypes(Unknown Source)
    at org.apache.xerces.impl.dv.xs.SchemaDVFactoryImpl.createBuiltInTypes(Unknown Source)
    at org.apache.xerces.impl.dv.xs.SchemaDVFactoryImpl.<clinit>(Unknown Source)
    ... 46 common frames omitted
```

This is because `XSSimpleTypeDecl` from Apache Xerces contains the following code:
{% include googlead1.html  %}
```java
void applyFacets1(XSFacets facets, short presentFacet, short fixedFacet) {
    try {
        // stuff happens...
        internalPrivateMethodHere();
    } catch (InvalidDatatypeFacetException e) {
        throw new RuntimeException("internal error");
    }
    fIsImmutable = true;
}
```

Unfortunately, the original `InvalidDatatypeFacetException` is swallowed here which is a very poor practice. Without code modifications to get access to the original error, it's pretty impossible to determine the root cause and figure out exactly why the application is crashing. This is where Graal VM Substitions can help.

# Graal VM Substitutions

Graal VM provides a substitution mechanism to handle scenarios where the offending source code is for whatever reason unavailable or cannot easily be changed. At AOT compile-time, Graal VM native image can change and transform specific bytecode by replacing or deleting it. Substitutions are typically developed in Java, and we will have to build a small substitution that would allow us to see the original exception by logging it.

Modify your project to include the Graal VM SDK dependency and make sure it's *only available at compile-time*. Then we can start with the following outline:
{% include googlead1.html  %}
```java
/*
    You can name your class anything you want.
    You need to make sure the class is marked as final.
*/
@TargetClass(org.apache.xerces.impl.dv.xs.XSSimpleTypeDecl.class)
public final class XSSimpleTypeDecl {
    @Substitute
    void applyFacets1(XSFacets facets, short presentFacet, short fixedFacet) {
        try {
            // stuff happens...
            internalPrivateMethodHere();
        } catch (InvalidDatatypeFacetException e) {
            e.printStackTrace();
            throw new RuntimeException("internal error", e);
        }
        fIsImmutable = true;
    }
}
```

Of course, the above substitution would not compile because:

1. We need access to `internalPrivateMethodHere();` which is an internal private method; the name is specifically chosen for maximum effect.
2. We need access to the `fIsImmutable` field.

{% include googlead1.html  %}
To solve the first issue, we can use an alias to refer to the original method:

```java
@Alias
void internalPrivateMethodHere() throws InvalidDatatypeFacetException {
    // No implementation body is needed
}
```

An `@Alias` here allows Graal VM to reference the original method in the targetted class and the AOT compilation will make the correct substitution.

To solve the second issue, we will use the same approach to alias the needed field:
{% include googlead1.html  %}
```java
@Alias
@RecomputeFieldValue(kind = RecomputeFieldValue.Kind.None)
private boolean fIsImmutable;
```

If you build and launch the native image, you should now see the exception properly logged. In this case, it turns out that specific resources on the classpath need to be registered with the native image tooling. In a Spring Boot application, this can be done via:
{% include googlead1.html  %}
```java
hints.resources()
    .registerResourceBundle("org/apache/xml/security/resource/xmlsecurity")
    .registerResourceBundle("org/apache/xerces/impl/msg/XMLSchemaMessages")
    .registerResourceBundle("org/apache/xerces/impl/xpath/regex/message")
```

When you are done with the fix, the substitution can be removed. Then, onto the next error!

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

