---
layout:     post
title:      Apereo CAS - Working w/ Spring Application Profiles
summary:    A brief overview of Spring Application Profiles, their purpose and utility in general when it comes to configuration management, bean definitions, and better control over test activation and execution with a particular focus on Apereo CAS deployments.
tags:       ["CAS 7.1.x", "Spring Boot", "Gradle"]
---

Application profiles managed by the Spring framework are handy when it comes to defining different application configurations for various environments. For example, you might have a Spring-powered web application such as Apereo CAS that needs to behave differently in development, testing, and production environments. A profile in Spring is an approach that allows you to isolate and group configuration settings under a label, such as `dev`, `test`, or `prod` with additional mechanics to then activate the appropriate profile based on business rules and use cases.

{% include googlead1.html  %}

Note that while profiles are mostly commonly used to group settings *per environment*, that is not their only utility. You might consider breaking down your application configuration and settings into multiple profiles even when you just have a single environment. In such scenarios, profiles are essentially thought of as *feature groups* that mainly categorize a collection of related settings under one label, for easier discovery and maintenance. 

{% include googlead1.html  %}

In this post, we will take a brief look at how application profiles might be configured in the context of Apereo CAS deployments, what their different activation rules are, and how they may be used to influence the spring application container when it comes to filtering and selecting beans for both execution runtime and test validation. Our starting position, not to be taken too seriously in this context, is as follows:
- CAS `7.1.x`
- Java `21`

# Application Profiles

Let's imagine a CAS deployment that wants to isolate its configuration per tier in a world where there are `dev`, `test`, or `prod` environments. We must also note that our deployment environments share many common settings, and we are only interested in grouping and separating a *specific* set of settings for each tier. So, our configuration layout would take the following form:
{% include googlead1.html  %}
- All application settings common to all environments would be defined in the usual `cas.properties` file.
- All application settings that should take form in our `dev` environment would be placed inside a `cas-dev.properties`.
- All application settings that should take form in our `test` environment would be placed inside a `cas-test.properties`.
- All application settings that should take form in our `prod` environment would be placed inside a `cas-prod.properties`.

You get the idea. More concretely, let's suppose that our `cas.properties` file has the following setting:
{% include googlead1.html  %}
```properties
cas.tgc.pin-to-session=false
```

Our `cas-dev.properties` file has the following setting:

```properties
cas.ticket.st.time-to-kill-in-seconds=90
```

Our `cas-test.properties` file has the following setting:
{% include googlead1.html  %}
```properties
cas.ticket.st.time-to-kill-in-seconds=60
```

Our `cas-prod.properties` file has the following setting:

```properties
cas.ticket.st.time-to-kill-in-seconds=15
```

When we run the deployment with the `dev` profile, the final collection of settings that are chosen by the system would be:
{% include googlead1.html  %}
```properties
cas.tgc.pin-to-session=false
cas.ticket.st.time-to-kill-in-seconds=90
```

When we run the deployment with the `test` profile, the final collection of settings that are chosen by the system would be:

```properties
cas.tgc.pin-to-session=false
cas.ticket.st.time-to-kill-in-seconds=60
```

When we run the deployment with the `prod` profile, the final collection of settings that are chosen by the system would be:
{% include googlead1.html  %}
```properties
cas.tgc.pin-to-session=false
cas.ticket.st.time-to-kill-in-seconds=15
```

# Profile Selection

Our goal now would be to teach CAS to select the common configuration file as well as one that is assigned to our environment. By default, CAS ships with a `standalone` configuration profile whose job is to direct the underlying configuration machinery to do precisely that; find the shared file and combine that with the profile-specific configuration file. 
{% include googlead1.html  %}
Note that the `standalone` profile is always active (unless you take matters into your own hands) which means we just have to teach the system about the active profile and the rest will be automtically handled by the system.

# Profile Activation

To activate the profile, we need to evaluate the method used to run the CAS web application. If you are, for example, running the CAS web application directly as a Spring Boot application, then the activation instruction takes the following form as a command-line argument:

```bash
java -jar /path/to/cas.war --Spring.profiles.include=dev
```

Or if you are running CAS as an executable web application file, it takes on a fairly identical form:
{% include googlead1.html  %}
```bash
/path/to/cas.war --Spring.profiles.include=dev
```

You might instead prefer to activate the right profile as an environment variable before running CAS itself:

```bash
export SPRING_PROFILES_INCLUDE=dev
```

Or perhaps you feel much more comfortable with a system property:
{% include googlead1.html  %}
```bash
java -Dspring.profiles.include=dev -jar /path/to/cas.war
```

...and more. All activation methods result in the same outcome and have no technical preference over one another pre se; it's largely up to you to figure out which solution works best for you and is easiest to maintain. Anecdotally, the *command-line argument* method appears to be most common in the wider Spring ecosystem.

# Spring Beans

So far, we have used application profiles to select and filter application settings. We can do the exact same thing to influence the Spring bean selection process. For example, you might want to create a `DataSource` bean that establishes a connection to an underlying database, and yet the database system itself and the mechanics and rules that build the bean definition would need to be isolated per tier. The end-result would be similar to the following:
{% include googlead1.html  %}
```java
@Bean
@Profile({"test", "dev"})
public DataSource testDataSource() {
    ...
}

@Bean
@Profile("prod")
public DataSource prodDataSource() {
    ...
}
```

# Testing

You may also control how the Spring container selects tests per environment profile. For example, you might have a batch of tests that should only run when the activated profile is either `dev` or `test`, and another batch to run when the profile is `prod`. Again, the end-result would match something close to this:
{% include googlead1.html  %}
```java
@Test
@IfProfileValue(name = "spring.profiles.active", values = {"dev", "test"})
void testStuff() {
    ...
}

@Test
@IfProfileValue(name = "spring.profiles.active", values = {"prod"})
void testStuffMore() {
    ...
}
```

Or you might go one step further and limit the selection and execution of tests solely based on the active profile:
{% include googlead1.html  %}
```java
@SpringBootTest
@ActiveProfiles("dev")
public class AllDevTests {

    @Test
    void testStuff() {
    }
}
```

# Active vs. Include

When it comes to profile selection, Spring offers two choices: `spring.profiles.active` and `spring.profiles.include`. You might ask, what is the difference? Indeed. These two properties both deal with activating profiles, but they serve different purposes. 

When you use `spring.profiles.active`, you're instructing the system to activate the assigned profiles, disregarding anything that might be activated by default. In a CAS context, using `spring.profiles.active=dev` would mean that CAS would no longer look at its own `standalone` profile, and everything and anything attached to that profile would be dropped. The only active profile from the CAS point of view would then be `dev`. 
{% include googlead1.html  %}
When you use `spring.profiles.include`, you're instructing the system to include *additional profiles* that should be active in addition to those that are active or considered to be active by default. It allows you to include profiles without overriding default system behavior. In a CAS context, using `spring.profiles.include=dev` would mean that CAS would look at its own `standalone` profile and combine it with the `dev` profile. 

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services. 

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)