---
layout:     post
title:      Apereo CAS - Announcements & Message Of The Day
summary:    Learn how to modify the Apereo CAS user interface to dynamically display announcements and messages of the day from external sources.
tags:       ["CAS 7.1.x", "Spring Webflow", "UI/UX", "Groovy"]
---

The Apereo CAS presents its user interface backed by [the Thymeleaf framework](https://www.thymeleaf.org/). Thymeleaf's main goal is to *bring natural, elegant pages backed by simple HTML that can be correctly displayed in browsers*. Such templates can be broken down into smaller reusable chunks called fragments to ultimately assemble and compose an entire page in CAS. Our intention in this blog post is to modify such fragments in Apereo CAS to display announcements and messages dynamically that are produced by external sources with custom logic and scripted conditions.
 
{% include googlead1.html %}

Our starting position is as follows:

- CAS `7.1.x`
- Java `21`

# Requirements

Let's begin with the initial premise that our announcements and messages are to be displayed directly on the login screen, right above the area where the users are expected to present their credentials. Here is the sort of final outcome we expect to see:

{% include image.html img="/images/blog/assets/msgoftheday.png" width="50%" title="Apereo CAS - Announcements & Message Of The Day" %}

Of course, we want to be able to change this announcement dynamically without having to restart the CAS server.

# User Interface

The area in the user interface that needs to be modified is owned by a dedicated CAS fragment called `serviceui.html.` We can begin by pulling this fragment into our own CAS overlay project:

```bash
./gradlew[.bat] getResource -PresourceName=serviceui
```

This will fetch the fragment and put it at the following path: `src/main/resources/templates/fragments/serviceui.html`. We can modify the fragment next to pull our announcements and messages from an external source:

```html
<div th:fragment="serviceUI" 
    id="serviceui" 
    class="banner banner-info mb-4 text-justify">
    <div class="d-flex align-items-center pr-2">
        <strong th:utext="#{announcement.title}"></strong>
        <p th:utext="#{announcement.body}"></p>
    </div>
</div>
```

Let's break this down:

- In Thymeleaf, `utext` is a utility function used to insert unescaped text into your HTML templates. This means that the text you insert will not be HTML-escaped, allowing you to include HTML content directly.
- `#{announcement.title}` is a special syntax that instructs CAS and thymeleaf to load the text attached to the language key `announcement.title` from a language bundle. This text can include HTML and will then be rendered using the `utext` directive.

This means all we have to do is to define our language bundle and define two keys `announcement.title` and `announcement.body` in there with our title and message of the day. 

# Language Bundles

A language bundle (or resource bundle) is a way to manage internationalization (i18n) and localization (l10n) of CAS. It allows you to provide multiple language translations for the CAS user interface texts, messages, and labels, making it adaptable to different locales. A language bundle is typically a set of `.properties` files where each file contains key-value pairs. Each key represents a specific piece of text and the value is the translated text for a specific language.

By default, CAS looks at the following language bundles to find the text attached to a key:

- `/etc/cas/config/custom_messages.properties`
- `classpath:custom_messages.properties` 
- `classpath:messages.properties`

The system will look at each file one by one to find a given language key, i.e. `announcement.title`. Let's define our two keys inside `/etc/cas/config/custom_messages.properties`, which has the added advantage that changes to this bundle can be done outside the CAS web application, removing the need for repackaging and rebuilding of the CAS server:

```properties
announcement.title=Hey there!
announcement.body=Do you know why skeletons don't fight each other? They don't have <i>the guts</i>!
```

# Updating Messages

Language bundles in CAS are cached for performance reasons. Once the system has loaded a bundle, it will usually hold onto and cache its contents for about 3 minutes before reloading it. If you want to see instantaneous changes to your language bundle and don't wish to wait too long, you can adjust the following property in your CAS settings:

```properties
cas.message-bundle.cache-seconds=3
```

The above change will allow CAS to reload the language bundle after 3 seconds, thus allowing you to change the bundle and update messages to see the change shortly after without having to restart or rebuild the server.

# Dynamic Messages

The strategy so far works for very basic and modest of use cases. Let's make life more interesting by outsourcing the message to an external REST API. Essentially, we would want CAS to reach out to an external API, fetch a message, and pass that onto the login screen for rendering. To handle this, we can use the webflow decorators in CAS.

A webflow decorator in CAS is an easier option that allows you to *decorate* the webflow dynamically, and it takes care of the internal webflow configuration. Such decorators specifically get called upon as CAS begins to render the login view while reserving the right to decorate additional parts of the webflow in the future.

For our purposes, let's use a Groovy script to decorate the webflow:

```properties
cas.webflow.login-decorator.groovy.location=file:/path/to/MyDecorator.groovy
```

The script itself would have the following structure:

```groovy
import java.net.*

def run(Object... args) {
    def (requestContext, logger) = args
    // Reach out to an external API...

    def url = new URL('https://icanhazdadjoke.com')
    def connection = (HttpURLConnection) url.openConnection()
    connection.setRequestMethod('GET')
    connection.setRequestProperty('Accept', 'text/plain')
    def body = connection.inputStream.text

    // Pass the body to the webflow context...
    requestContext.flowScope.put('announcementBody', body)
}
```

All that remains is to modify our fragment from earlier and let it use the new `` flow variable:

```html
<div th:fragment="serviceUI" 
    id="serviceui" 
    class="banner banner-info mb-4 text-justify">
    <div class="d-flex align-items-center pr-2">
        <strong th:utext="#{announcement.title}"></strong>
        <p th:utext="${announcementBody}"></p>
    </div>
</div>
```

Note that,

- The announcement title is still being pulled in via the language bundle using `#{announcement.title}`.
- The main difference here is `${announcementBody}`, which allows the CAS webflow to render the text attached to the referenced variable.

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html