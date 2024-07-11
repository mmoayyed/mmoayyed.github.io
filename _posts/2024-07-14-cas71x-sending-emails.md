---
layout:     post
title:      Apereo CAS - Email Server Configuration
summary:    Learn how to configure various email servers in Apereo CAS and use email to share password reset links, tokens and more with users.
tags:       ["CAS 7.1.x", "Spring Boot", "AWS", "Email"]
---

Sending emails is a significant feature in Apereo CAS, whether for user registration, password reset links, multifactor tokens, or other purposes. CAS supports a large number of email providers, some of which use the default `JavaMail` API and `SMTP`. Then there are more advanced options like Amazon SES, SendGrid, Mailgun, and Mailjet that might require a dedicated and nuanced integration path. 

{% include googlead1.html  %}
In this post, you'll understand the email-sending capabilities available in Apereo CAS and be equipped to choose the best solution for your needs. Our starting position is as follows:
- CAS `7.1.x`
- Java `21`

# JavaMail & SMTP

The `JavaMail` API provides a standard way to send emails from Java applications, and it's seamlessly integrated with Apereo CAS via Spring Boot to make email sending straightforward and efficient. At a minimum, you will need to set up a few properties, such as the SMTP server details, and CAS via Spring Boot simplifies the rest of the process with its auto-configuration capabilities, allowing you to focus on crafting your email content and handling various requirements like HTML formatting. 

The set of configuration properties that Spring Boot offers to CAS usually match the following set:
{% include googlead1.html  %}
```properties
spring.mail.host=smtp.server.org
spring.mail.port=587
spring.mail.username=<username>
spring.mail.password=<password>
# spring.mail.properties.mail.transport.protocol=smtp
# spring.mail.properties.mail.smtp.starttls.enable=true
# spring.mail.properties.mail.smtp.starttls.required=true
# spring.mail.properties.mail.smtp.auth=true
spring.mail.default-encoding=UTF-8
spring.mail.test-connection=false
```

<div class="alert alert-info">
  <strong>Remember</strong><br/>The <code>spring.mail.test-connection</code> property when set to <code>true</code>, would test the SMTP connection on application launch, which means if the connection fails, an error will be thrown and the CAS launch will fail.
</div>
{% include googlead2.html  %}
This option generally works quite well for any email server or provider that is able to provide and support SMTP, which means it will be sufficient for most scenarios.

# Amazon Simple Email Service (SES)

Amazon Simple Email Service (SES) is a cloud-based email-sending service designed to provide high deliverability and scalability. Integrating Amazon SES with Spring Boot allows you to leverage this service to send transactional and marketing emails. 
{% include googlead1.html  %}
[CAS uses the AWS SDK](https://apereo.github.io/cas/development/notifications/Sending-Email-Configuration-AmazonSES.html) for Java to configure Amazon SES and handle email sending tasks. With a few simple steps, including setting up your AWS credentials to configure the SES client, you can start sending emails through Amazon's infrastructure. 

Once you have included the right module in your CAS build, a very basic setup could mean the following settings:
{% include googlead1.html  %}
```properties
cas.email-provider.ses.region=us-east-1
cas.email-provider.ses.credential-access-key=...
cas.email-provider.ses.credential-secret-key=...
```

# SendGrid

SendGrid is a popular cloud-based email service known for its robust features and ease of use, making it an excellent choice for sending transactional and marketing emails. Integrating SendGrid with CAS allows you to take advantage of SendGrid's email delivery platform. By incorporating the [relevant library](https://apereo.github.io/cas/development/notifications/Sending-Email-Configuration-SendGrid.html) into your CAS project, you can quickly configure the necessary API keys and settings to start sending emails. 

Just as before, once you have included the right module in your CAS build, a fundamental setup could mean the following settings:
{% include googlead1.html  %}
```properties
spring.sendgrid.api-key=...
spring.sendgrid.endpoint=https://api.sendgrid.com/v3/mail/send
```

# Mailjet

Mailjet is a comprehensive email service provider offering various features for sending transactional and marketing emails. Integrating Mailjet with CAS allows you to utilize its API for email delivery and analytics. By adding [the required library](https://apereo.github.io/cas/development/notifications/Sending-Email-Configuration-Mailjet.html) to your CAS build, you can easily configure your API keys and set up the necessary properties to start sending emails. 

Just as before, once you have included the right module in your CAS build, a fundamental setup could mean the following settings:
{% include googlead1.html  %}
```properties
cas.email-provider.mailjet.api-key=...
cas.email-provider.mailjet.secret-key=...
```

# Need Help?

If you have questions about this blog post's content or topic, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

## Finale

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute](https://apereo.github.io/cas/developer/Contributor-Guidelines.html) as best as you can.

[Misagh Moayyed](https://fawnoos.com)
