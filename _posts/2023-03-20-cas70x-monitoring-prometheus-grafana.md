---
layout:     post
title:      Apereo CAS - Monitoring Metrics with Prometheus and Grafana
summary:    Learn how to monitor your Apereo CAS deployment in production using open-source tools such as Prometheus and Grafana to set up dashboards, visualize CAS-specific metrics and gain insight into the running CAS software.
tags:       ["CAS 7.0.x", "Monitoring", "Docker", "Spring Boot"]
---

When Apereo CAS is deployed in production, it needs to be monitored and observed to watch out for possible performance issues. Many commercial tools can tap into the APM (Application Performance Metrics) exported by CAS to provide monitoring capabilities. In this post, we will examine two open-source tools called [Prometheus](https://prometheus.io) and Grafana which gather and store metrics data in a time-series format and visualize it on dashboards.

{% include googlead1.html %}

This tutorial specifically requires and focuses on:

- CAS `7.0.x`
- Java `21`
- [CAS WAR Overlay](https://github.com/apereo/cas-overlay-template)

# CAS Metrics

As a Spring Boot application, CAS provides two dedicated actuator endpoints that export metrics and curate that data for Prometheus. Assuming your CAS server is running on post `8080`, these endpoints typically are available at:

- `http://localhost:8080/cas/actuator/metrics`
- `http://localhost:8080/cas/actuator/prometheus`
{% include googlead1.html %}
To allow these endpoints to properly collect and export CAS metrics, you would need to include the following modules in your CAS build:

```groovy
implementation "org.apereo.cas:cas-server-support-reports"
implementation "org.apereo.cas:cas-server-support-metrics"
```

You may also need to enable the `prometheus` endpoint and have it export metrics data:

```properties
management.endpoint.prometheus.enabled=true
management.prometheus.metrics.export.enabled=true
```

Note that in addition to all the usual metric data collected by Spring Boot, CAS itself provides specific metrics that monitor and observe ticketing and service management operations by employing *Micrometer Observations*. For example, you may notice the following metrics when you access the `prometheus` endpoint:
{% include googlead1.html %}
```
# HELP org_apereo_cas_ticket_registry_TicketRegistrySupport_getAuthenticationFrom_active_seconds  
# TYPE org_apereo_cas_ticket_registry_TicketRegistrySupport_getAuthenticationFrom_active_seconds summary
org_apereo_cas_ticket_registry_TicketRegistrySupport_getAuthenticationFrom_active_seconds_active_count 0.0
org_apereo_cas_ticket_registry_TicketRegistrySupport_getAuthenticationFrom_active_seconds_duration_sum 0.0

# HELP org_apereo_cas_ticket_registry_TicketRegistrySupport_getAuthenticationFrom_active_seconds_max  
# TYPE org_apereo_cas_ticket_registry_TicketRegistrySupport_getAuthenticationFrom_active_seconds_max gauge
org_apereo_cas_ticket_registry_TicketRegistrySupport_getAuthenticationFrom_active_seconds_max 0.0

# HELP org_apereo_cas_ticket_registry_TicketRegistryCleaner_clean_seconds_max  
# TYPE org_apereo_cas_ticket_registry_TicketRegistryCleaner_clean_seconds_max gauge
org_apereo_cas_ticket_registry_TicketRegistryCleaner_clean_seconds_max{error="none",} 0.003608625

# HELP org_apereo_cas_ticket_registry_TicketRegistryCleaner_clean_seconds  
# TYPE org_apereo_cas_ticket_registry_TicketRegistryCleaner_clean_seconds summary
org_apereo_cas_ticket_registry_TicketRegistryCleaner_clean_seconds_count{error="none",} 3.0
org_apereo_cas_ticket_registry_TicketRegistryCleaner_clean_seconds_sum{error="none",} 0.006713916
```

# Collecting Metrics via Prometheus

Prometheus is an open-source systems monitoring and alerting toolkit. It collects and stores its metrics as time series data, i.e. metrics information is stored with the timestamp at which it was recorded, alongside optional key-value pairs called labels. Metrics are numeric measurements. Time series means that changes are recorded over time. 

You can run Prometheus as a Docker container. For example,
{% include googlead1.html %}
```bash
docker run --rm -d -p 9090:9090 --name "prom-server" \
  -v "/path/to/prometheus.yml":/etc/prometheus/prometheus.yml \
  prom/prometheus
```

The `prometheus.yml` should instruct Prometheus to pull metrics data from CAS:

```yaml
scrape_configs:
  - job_name: 'Apereo CAS Metrics'
    metrics_path: '/cas/actuator/prometheus'
    scrape_interval: 5s
    static_configs:
      - targets: ['CAS_SERVER_URL_GOES HERE']
        labels:
          application: 'Apereo CAS'
```

Once you have it up and running, you can access the Prometheus dashboard and query for metrics:

{% include image.html img="https://user-images.githubusercontent.com/1205228/229272487-b3a5aa9b-1728-46f6-aba9-224fd9b2780b.png"
width="60%" title="Apereo CAS Monitoring Metrics with Prometheus and Grafana" %}
{% include googlead1.html %}
...or build graphs from CAS metrics data on ticketing operations:

{% include image.html img="https://user-images.githubusercontent.com/1205228/229272723-c9fe944f-7fa3-4279-a00d-462dc3a284ba.png"
width="60%" title="Apereo CAS Monitoring Metrics with Prometheus and Grafana" %}
{% include googlead1.html %}
...or you can examine Prometheus targets to see how often data is ingested and scraped from CAS:

{% include image.html img="https://user-images.githubusercontent.com/1205228/229272997-724ef958-4bcb-47bc-8c9d-4f27d3f6ddaa.png"
width="70%" title="Apereo CAS Monitoring Metrics with Prometheus and Grafana" %}
{% include googlead1.html %}
# Visualizing Metrics via Grafana

Grafana is a multi-platform open source analytics and interactive visualization web application. It provides charts, graphs, and alerts for the web when connected to supported data sources.

Just as before, you can run Grafana using Docker:

```bash
docker run --rm -d -p 3000:3000 --name "grafana-server" \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  -e GF_SERVER_DOMAIN=localhost
  grafana/grafana-oss
```

Next, Prometheus needs to be configured in Grafana as a data source:

{% include image.html img="https://user-images.githubusercontent.com/1205228/229280395-3f72bd35-9012-4afd-91c6-91ff2c6fc6b3.png"
width="60%" title="Apereo CAS Monitoring Metrics with Prometheus and Grafana" %}
{% include googlead1.html %}
At this point, you should be able to explore the Prometheus data source and check out the collection of available metrics:

{% include image.html img="https://user-images.githubusercontent.com/1205228/229280441-42a05cfb-8a63-4ab6-a52f-f917ec105923.png"
width="60%" title="Apereo CAS Monitoring Metrics with Prometheus and Grafana" %}
{% include googlead1.html %}
...and then, get your graphs added to the dashboard:

{% include image.html img="https://user-images.githubusercontent.com/1205228/229277605-856461e6-a973-4556-8fc0-62d9f4896666.png"
width="60%" title="Apereo CAS Monitoring Metrics with Prometheus and Grafana" %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html