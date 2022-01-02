---
layout:     post
title:      Apereo CAS - Docker Infrastructure Deployment w/ Terraform
summary:    Deploy and manage an Apereo CAS Docker container using Terraform, HashiCorp's Infrastructure as Code tool.
tags:       ["CAS 6.4.x", "Docker", "Terraform"]
---

Infrastructure as code (IaC) tools allow you to manage infrastructure with configuration files rather than through a graphical user interface. [Terraform](https://learn.hashicorp.com/terraform) is HashiCorp's *Infrastructure as Code* tool. It lets you define resources and infrastructure in human-readable, declarative configuration files, and manages your infrastructure's lifecycle.

In this blog post, we will take a look at what it takes to deploy and run an Apereo CAS Docker container using Terraform. Our starting position is based on the following:

{% include googlead1.html  %}

- CAS `6.4.x`
- [Terraform](https://learn.hashicorp.com/terraform)
- [HomeBrew](https://brew.sh/)
- MacOS Big Sur

## Installation

Installing Terraform on MacOS using [HomeBrew](https://brew.sh/) takes the following commands:

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

## Terraform Configuration

The set of files used to describe an *Apereo CAS Deployment* infrastructure in Terraform is known as a Terraform *configuration*. In this first approach, we plan to build, change, and destroy *Docker* infrastructure using Terraform without specifically dealing with a Cloud platform like AWS or Azur. Our CAS configuration, as is the case for every Terraform configuration, must be in its own working directory and looks something like this:

{% include googlead1.html  %}
```
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.13.0"
    }
  }
}

provider "docker" {}

variable "server_port" {
  description = "The Apach Tomcat server port to bind"
  type        = number
  default     = 8080
}

resource "docker_image" "cas" {
  name         = "apereo/cas:6.4.4.2"
  keep_locally = false
}

resource "docker_container" "cas" {
  image = docker_image.cas.latest
  name  = "cas-server"
  env = ["SERVER_SSL_ENABLED=false", "SERVER_PORT=${var.server_port}"]
  ports {
    internal = 8080
    external = 8080
  }
}

output "container_id" {
  description = "ID of the Docker container"
  value       = docker_container.cas.id
}

output "image_id" {
  description = "ID of the Docker image"
  value       = docker_image.cas.id
}
```

A few things to note:

- The `provider` block configures the specified `docker` provider, which is used by Terraform to create and manage your resources.
- Our CAS Docker image resource is based on `apereo/cas:6.4.4.2` and is then deployed as a Docker container with the name `cas-server`, where the container is instructed by default to map the host port `8080` to that of the container.
{% include googlead1.html  %}
- The CAS Docker container is configured to set a few environment variables that are translated by Spring Boot to disable the SSL configuration and to provide an easy and configurable way to set the Apache Tomcat's port that is used by a client to access CAS.
- We also define a few outputs that we could then query using the `terraform output` command. Terraform prints output values to the screen when we apply the configuration.

If we are happy with the defaults and are ready to build, we could just run:

```bash
terraform apply
```

To have the CAS Docker container and the underlying Apache Tomcat web server bind on port `8081`, we could run:

```bash
terraform apply -var "server_port=8081"
```
{% include googlead1.html  %}
You could examine the launched CAS container via `docker ps`, and of course tail the CAS logs via `docker logs cas-server`. Of course, the CAS web application itself can be accessed via `http://localhost:[8080|8081]/cas` (depending on your port selection at build time).

Finally, we can shut everything down and destroy the Docker infrastructure:

```bash
terraform destroy
```

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
