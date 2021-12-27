---
layout:     post
title:      Apereo CAS - Deployment on Heroku (PaaS) Cloud
summary:    Learn how to deploy Apereo CAS on the Heroku cloud platform using a git repository and a push-to-deploy model.
tags:       ["CAS 6.3.x"]
---

[Heroku](https://www.heroku.com/) is a cloud Platform-as-a-Service (PaaS) platform with a powerful ecosystem for deploying and running modern apps. The Heroku developer experience is an app-centric approach for software delivery and is quite pleasant, especially if you follow the push-to-deploy model by connecting its environment to a git repository. 

{% include googlead1.html  %}

In this post, we will take a look at how Apereo CAS can be deployed on Heroku comfortably by connecting a CAS overlay project to Heroku via git. Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- [The Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# Heroku Setup

You will need to start by creating an application on Heroku, i.e. `casserver`. Then, navigate to your application settings and specify an environment variable for `JAVA_OPTS` with `-Xms256m -Xmx4048m -XX:MaxHeapSize=256m -XX:+UseCompressedOops -XX:SoftRefLRUPolicyMSPerMB=0 -noverify -XX:TieredStopAtLevel=1` as the value. Finally, make sure you add the `heroku/gradle` build pack under settings to allow a CAS gradle overlay to build and deploy.

![image](https://user-images.githubusercontent.com/1205228/94346220-065f2780-0038-11eb-8d48-523330f062a2.png)

Take note of the Heroku git URL as this would become the git repository's main remote entry for pushing changes.

# CAS Setup

Navigate to the CAS overlay project, and make sure to define a new remote for `heroku` based on the project's Heroku git URL:

{% include googlead1.html  %}

```bash
git remote add heroku https://git.heroku.com/casserver.git
```

Next, we need to set up a `Procfile` for Heroku to run our CAS server web application. This file specifies the commands that are executed by the app on startup and is always a simple text file that is named `Procfile` without a file extension. The `Procfile` MUST live in the overlay's root directory. 

Our CAS server's `Procfile` would be as follows:

```
web:    java $JAVA_OPTS -jar build/libs/cas.war \
  --server.port=$PORT --server.ssl.enabled=false \
  --cas.server.name=https://casserver.herokuapp.com \
  --cas.server.prefix=https://casserver.herokuapp.com/cas
```

The `web` process type is special: it’s the only process type that can receive external HTTP traffic from Heroku’s routers. As you note, various other CAS settings can be specified in the command that runs the web application server using an embedded Tomcat container. Two settings are important to highlight:

{% include googlead1.html  %}

- `server.port=$PORT` allows the embedded Tomcat container to bind on a port that is defined and selected by the Heroku platform.
- `server.ssl.enabled=false` disables the SSL and keystore configuration of the embedded Tomcat container that is auto-configured by Spring Boot, allowing it to be managed by Heroku directly.

We also should create a `system.properties` file at the root of the project that indicates the required JDK version for the CAS server to Heroku. The file should contain the following entry:

```
java.runtime.version=11
```

At this point, you can commit all changes to the repository and push to the `heroku` remote:

```bash
git commit -A .
git push heroku master
```

{% include googlead1.html  %}

If you wanted to monitor the build and deployment progress using the Heroku CLI, you will need to first login using `heroku login`, and then track the process logs using `heroku logs --source app --tail --app casserver`. Once ready, the CAS server will be available at `https://casserver.herokuapp.com/cas`.


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)