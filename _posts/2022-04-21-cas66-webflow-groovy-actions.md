---
layout:     post
title:      Apereo CAS - Getting Groovy with Spring Webflow
summary:    Learn how to customize and tune various aspects of the CAS authentication flow using Groovy.
tags:       ["CAS 6.6.x", "Groovy", "Spring Webflow", "UI/UX"]
---

The authentication flow in Apereo CAS is managed and orchestrated by Spring Webflow. Spring Webflow allows CAS to ship with a pluggable architecture where custom actions, views, and decisions may be injected into the flow to account for additional use cases and processes. In this walkthrough, we will take a look at parts of the CAS authentication flow that may be decorated and customized using Groovy. 

{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Dear Reader</strong><br/>Remember that the objective of this post is NOT to teach one how Spring Webflow itself works internally. If you want to learn more about Spring Webflow and understand the internals of actions, states, decisions and scopes please visit the <a href="https://github.com/apereo/spring-webflow/">Spring Webflow project</a>.
</div>

Our starting position is based on the following:

- CAS `6.6.x`
- Java `11`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

## Overview

CAS uses Spring Webflow to process the login and logout authentication workflows. Spring Webflow builds on top of Spring MVC and defines the concept of a *flow*, which begins to encapsulate a sequence of steps that guide the user through the execution of some business task, (i.e. *validate user-provided credentials*). A flow definition spans multiple HTTP requests, has a state, deals with transactional data, is reusable, and may be dynamic and long-running. Each flow may contain among many other settings the following major elements:
{% include googlead1.html  %}
- Actions: components that describe an executable task and return a result
- Transitions: Routing the flow from one state to another; Transitions may be global to the entire flow.
- Views: Components that describe the presentation layer displayed back to the client
- Decisions: Components that conditionally route to other areas of flow and can make logical decisions

To customize the webflow, one must possess a reasonable level of understanding of the webflow internals and injection policies. To assist with the learning curve and fewer customizations, most CAS modules attempt to autoconfigure the CAS webflow to suit their needs. This practically means that the CAS adopter would no longer have to manually hand-massage the CAS webflow configuration, and the module automatically takes care of all required changes. 

{% include googlead1.html  %}
Of course, you may still wish to customize bits and pieces of the authentication flow but without having to deal with a Java-based development environment. Webflow customizations that are carried out in Groovy allow you to modify the internals of Spring Webflow outside the core CAS web application bundle and runtime using dedicated scripts that may be watched and auto-reloaded upon detecting changes.

## Webflow Decorations

There are times when you may need to modify the CAS login webflow to include additional data, typically fetched from outside resources and endpoints that may also be considered sensitive and may require credentials for access. Examples include displaying announcements on the CAS login screen or other types of dynamic data. 

{% include googlead1.html  %}
To handle this sort of use case, one option would be to let CAS decorate the webflow automatically by reaching out to external data and input sources such as REST APIs, Groovy scripts, etc, to decorate the Webflow with data while it itself would take care of the internal webflow configuration. With this option, you wouldn't have to know a whole lot of details about Spring Webflow in CAS works internally. Such decorators specifically get called upon as CAS begins to render the login view while reserving the right to decorate additional parts of the webflow in the future.

{% include googlead1.html  %}
Note that decorators only inject data into the webflow context where that data, later on, becomes available to the CAS login view, and more. Once the data is available, you still have the responsibility of using that data to properly display it in the appropriate view and style it correctly.

Groovy login decorators allow one to inject data into the Spring webflow context by using an external Groovy script that may take on the following form:

```groovy
class Decoration implements Serializable {
  private static final long serialVersionUID = 4949978905279568311L;
  String title;
}

def run(Object[] args) {
  def requestContext = args[0]
  def applicationContext = args[1]
  def logger = args[2]

  logger.info("Decorating the webflow...")
  requestContext.flowScope.put("decoration", new Decoration(title: "Hello!"))
 }
```
{% include googlead1.html  %}
Of course, you will have to instruct CAS to load the script:

```properties
cas.webflow.login-decorator.groovy.location=file:/path/to/Script.groovy
```

<div class="alert alert-info">
  <strong>Usage</strong><br/>The script filename is entirely your choosing, and could be any valid name that makes sense to you and helps to lower the maintenance burden.
</div>

Finally, you can begin to *decorate* the login flow by using the data element injected into the flow:
{% include googlead1.html  %}
```html
<span th:utext="${decoration.title}"></span>
```

## Webflow Actions

Some, but not all, Spring Webflow actions can be implemented entirely in Groovy, thereby supplanting the Java implementation that is provided by CAS. While this may not be advisable in all cases, you get the option to redesign the webflow and take over the implementation and customization of a particular task based on your needs.
{% include googlead1.html  %}
For example, you may want to customize the webflow to create and inject a dedicated cookie after a successful authentication attempt and around the time CAS begins to establish a single sign-on session. To handle this task, you can design a Spring Webflow action that looks more or less as such:

```groovy
import org.apereo.cas.authentication.principal.*
import org.apereo.cas.authentication.*
import org.apereo.cas.util.*
import org.apereo.cas.web.support.*
import org.springframework.webflow.*
import org.springframework.webflow.action.*
import org.apereo.cas.authentication.*
import org.apereo.cas.authentication.principal.*

import javax.servlet.http.Cookie

def run(Object[] args) {
  def requestContext = args[0]
  def applicationContext = args[1]
  def properties = args[2]
  def logger = args[3]

  def response = WebUtils.getHttpServletResponseFromExternalWebflowContext(requestContext)
  def authentication = WebUtils.getAuthentication(requestContext) as Authentication
  if (authentication != null) {
      def principal = authentication.getPrincipal() as Principal
      logger.info("Handling single signon action for ${principal.id}...",)
      def cookie = new Cookie("MyCookie", principal.id)
      cookie.setPath('/cas')
      response.addCookie(cookie)
      logger.info("Added cookie ${cookie.name}...")
  } else {
      logger.error("Unable to locate authentication in the webflow")
  }
  return null
}
```
{% include googlead1.html  %}
The above script creates a `MyCookie` cookie that carries the authentication user id; of course, the cookie could contain any value that you prefer based on the attributes fetched for the user via `principal.getAttributes()`, etc. The only thing that remains is for us to teach CAS about the script:

```properties
cas.webflow.groovy.actions.singleSignOnSessionCreated=file:/path/to/Action.groovy
```
{% include googlead1.html  %}
<div class="alert alert-info">
  <strong>Usage</strong><br/>Once more, the script filename is entirely your choosing. Pick any valid filename that you prefer, as long as the path is valid, found and CAS is given sufficient permissions to read the file.
</div>

There is one small caveat here: you will need to dig up the name of the original action <code>Bean</code> first before you can provide a Groovy substitute in CAS properties. This will require a careful analysis of CAS codebase to locate the bean and learn its name before you can proceed. Documenting the entire collection of all CAS Spring Webflow actions is a tedious, error-prone, and unmaintainable task. At some point, the CAS documentation will begin to list all recognized CAS Spring Webflow actions so you wouldn't have to go on a scavenger hunt to dig up a name. Until then, a manual search would have to do.

{% include googlead1.html  %}
Furthermore, note that not all Spring Webflow actions may be substituted with a Groovy equivalent. Groovy support in this area is a continuous development effort and will gradually improve throughout various CAS releases. Cross-check with the codebase to be sure.

## Bonus

If you prefer to provide an alternative implementation for the `singleSignOnSessionCreated` Spring webflow action in Java, you may provide the following bean definition to CAS:
{% include googlead1.html  %}
```java
@Bean
public Action singleSignOnSessionCreated() {
    return new MyPerfectAction();
}
```

## Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
