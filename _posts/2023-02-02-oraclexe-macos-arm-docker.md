---
layout:     post
title:      Running Oracle Databases via Docker on MacOS  ARM-based Sillicon
summary:    Learn how to run the Oracle databases on macOS ARM-based machines via Docker. 
tags:       ["Docker", "Miscellaneous"]
---

This is a quick review of how to run the an Oracle SQL databass on ARM-based machines (i.e. Apple Silicon) via Docker. The instructions posted here were originally put together based on `Docker version 20.10.22, build 3a2c30b`. 

{% include googlead1.html %}

# Intel x86_64

If you are on an Intel x86 machine, one could typically run an Oracle database via Docker as such:

```bash
echo "Running Oracle docker image..."
docker run --rm -d -p 1521:1521 --name oracle-db --rm store/oracle/database-enterprise:12.2.0.1-slim
echo "Waiting for Oracle image to prepare..."
sleep 90
docker ps | grep "oracle-db"
echo "Oracle docker image is running."
```
{% include googlead1.html %}
You can connect to this database in your Java applications via:

```properties
user=system
password=Oradoc_db1
driver-class=oracle.jdbc.driver.OracleDriver
url=jdbc:oracle:thin:@localhost:1521:ORCLCDB
dialect=org.hibernate.dialect.OracleDialect
```

This is not a multi-arch build so we have to find alternatives for ARM-based machines.

# ARM

If you are on an ARM-based machines (i.e. Apple Silicon), one alternative would be to run the Oracle Database Express Edition via Docker. Currently, there is no Oracle Database port for ARM chips, hence Oracle XE images cannot run on the new Apple M chips via Docker Desktop. Fortunately, there are other technologies that can spin up x86_64 software on Apple M chips, such as [colima](https://github.com/abiosoft/colima). 
{% include googlead1.html %}
Colima is a container runtimes on macOS (and Linux) with minimal setup. You can install it via:

```bash
brew install colima
```

...and then start it:

```bash
colima start --memory 4 --arch x86_64
```

...and then run the Docker container:
{% include googlead1.html %}
```bash
docker run -e ORACLE_PASSWORD=Oradoc_db1 -e ORACLE_DATABASE=ORCLCDB -p 1521:1521 gvenzl/oracle-xe
```
{% include googlead1.html %}
You can connect to this database in your Java applications via:

```properties
user=system
password=Oradoc_db1
driver-class=oracle.jdbc.driver.OracleDriver
# Connection type here is: Service Name
url=jdbc:oracle:thin:@//localhost:1521/ORCLCDB
dialect=org.hibernate.dialect.OracleDialect
```
{% include googlead1.html %}
...and when you are done:

```bash
colima stop
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html