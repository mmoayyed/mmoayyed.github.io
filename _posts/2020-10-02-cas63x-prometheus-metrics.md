---
layout:     post
title:      Apereo CAS - Monitoring Metrics with Prometheus and Grafana
summary:    Learn how to monitor Apereo CAS metrics, exported by Spring Boot actuators, using the open-source monitoring system, Prometheus. 
tags:       ["CAS 6.3.x"]
---

[Prometheus](https://prometheus.io/) is an open-source monitoring system designed to pull and scrap metrics data over HTTP periodically at a configured interval. It also presents a simple user interface to visualize, query, and monitor all the metrics. Prometheus is natively [supported by Apereo CAS](https://apereo.github.io/cas/6.3.x/monitoring/Configuring-Metrics.html) by taking advantage of Spring Boot's actuator metrics exported and supported by the Micrometer library; a framework that presents metrics data to a variety of external monitoring systems. 

{% include googlead1.html  %}

In this post, we will take a look at how Apereo CAS can export metrics over to Prometheus using Spring Boot actuators. Our starting position is as follows:

- CAS `6.3.x`
- Java `11`
- Docker
- [CLI JSON Processor `jq`](https://stedolan.github.io/jq/)
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# CAS Configuration

First, we should include support for actuators and metrics in the CAS overlay by including the following modules:

```gradle
implementation "org.apereo.cas:cas-server-support-metrics:${project.'cas.version'}"
implementation "org.apereo.cas:cas-server-support-reports:${project.'cas.version'}"
```

Furthermore, the Spring Boot `metrics` actuator endpoint must be turned on and enabled as well as support for Prometheus using the below settings:

```properties 
management.metrics.export.prometheus.enabled=true

management.endpoint.prometheus.enabled=true
management.endpoints.web.exposure.include=prometheus

cas.monitor.endpoints.endpoint.defaults.access=ANONYMOUS
```

{% include googlead1.html  %}

<div class="alert alert-warning">
  <strong>WATCH OUT!</strong><br/>The above collection of settings <strong>MUST</strong> only be used for demo purposes and serve as an <strong>EXAMPLE</strong>. It is not wise to enable and expose all actuator endpoints to the web and certainly, the security of the exposed endpoints should be taken into account very seriously. None of the CAS or Spring Boot actuator endpoints are enabled by default. For production, you should carefully choose which endpoints to expose.
</div>

At this point, once you build and run the CAS server you should be able to pull metrics names and data from the Prometheus endpoint:

```bash
curl https://sso.example.org:8443/cas/actuator/prometheus
```

# Prometheus Configuration

We can set up a Prometheus instance to pull metrics data from our `/prometheus` endpoint using Docker and the `prometheus.yml` configuration file with the following *example* settings:

```yaml
global:
  scrape_interval:     15s 
  evaluation_interval: 15s 

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
    - targets: ['127.0.0.1:9090']

  - job_name: 'spring-actuator'
    metrics_path: '/cas/actuator/prometheus'
    scrape_interval: 5s
    scheme: https
    tls_config:
      insecure_skip_verify: true
    static_configs:
    - targets: ['host.docker.internal:8443']
```

A few things should be pointed out:

{% include googlead1.html  %}

- The `target` element should point to the hostname and port of the running CAS server using the syntax `IP:PORT`. We are specifying the `scheme` as `https` and should specify our CAS server port that is `8443`. Since Prometheus will run as a Docker container, using `localhost` will certainly not work for the host ip address. Instead, `host.docker.internal` can be used (for testing and development purposes only) to indicate the IP address of the host machine that runs our CAS server. 
- The `insecure_skip_verify` is turned on to skip and disable SSL validation errors. This flag *should only* be used for development and demo purposes.
- The `metrics_path` element defines the path to the `prometheus` actuator endpoint that exposes metrics data.

At this point, you can run the following command to pull down the image and run the Prometheus container:

```bash
docker run --name=prometheus -p 9090:9090 \
    -v $PWD/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus --config.file=/etc/prometheus/prometheus.yml
```

# Visualizing Metrics

You can now navigate to the Prometheus dashboard `http://localhost:9090/new/targets` and browse the target environments:

![image](https://user-images.githubusercontent.com/1205228/94362564-1e32bc00-00c9-11eb-9b1f-69b7faeab485.png)

{% include googlead1.html  %}

Furthermore, you can add graphs based on the metric of choice to visualize metrics data over time:

![image](https://user-images.githubusercontent.com/1205228/94362607-71a50a00-00c9-11eb-9fb7-d15beb33fd78.png)

# Grafana Configuration

[Grafana](https://grafana.com/) is an open-source, analytics, and interactive visualization web application. It provides charts, graphs, and alerts for the web when connected to supported data sources. It allows you to bring data from various data sources like Prometheus and visualize them. 

A Grafana instance can be downloaded and run via Docker using:

```bash
docker run -d --name=grafana -p 3000:3000 grafana/grafana 
```

You can now navigate to `http://localhost:3000` and log in to Grafana with the default username `admin` and password `admin`.

Next, navigate to `http://localhost:3000/datasources` to set up a datasource for Prometheus:

![image](https://user-images.githubusercontent.com/1205228/94363706-00695500-00d1-11eb-9b79-4e0945b80f14.png)

{% include googlead1.html  %}

Note the URL address of the Prometheus server is `http://172.17.0.2:9090`, where the host is specified as the IP address of the running Prometheus Docker container. You can obtain this IP address via the following command:

{% raw %}
```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' prometheus 
```
{% endraw %}

Finally, you can now navigate to the dashboards, create a new dashboard with a Prometheus as the query data source:

![image](https://user-images.githubusercontent.com/1205228/94363862-0dd30f00-00d2-11eb-973c-2c7e29c3cb72.png)


# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please know that all other use cases, scenarios, features, and theories certainly [are possible](https://apereo.github.io/2017/02/18/onthe-theoryof-possibility/) as well. Feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)