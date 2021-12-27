---
layout:     post
title:      Apereo CAS - Python Web Application w/ Flask-CAS
summary:    Learn how to build a Python web application using Flask that is protected via an Apereo CAS server using the Flask CAS extension.
tags:       ["CAS 6.4.x", "Python"]
---

[Flask]() is a lightweight web application framework for Python, designed to make getting started quick and easy,
with the ability to scale up to complex applications. Python applications built on top Flask can take advantage of the [Flask-CAS](https://pypi.org/project/Flask-CAS/) extension to integrate the web application with Apereo CAS for single sign-on and authentication.

Our starting position is as follows:

{% include googlead1.html  %}

- CAS `6.4.x`
- Java `11`
- Python `3.9`

# Setup

First, you most likely need to make sure you have Flask-CAS installed via `pip`:

```bash
pip3 install Flask-CAS
```

This allows the Flask-CAS extension to be available and ready for your configuration in your application:

{% include googlead1.html  %}

```python
from flask import Flask, render_template, session, redirect, send_from_directory
from flask_cas import CAS
from flask_cas import login
from flask_cas import logout
from flask_cas import login_required

app = Flask(__name__)
cas = CAS(app, '/cas')
app.config['CAS_SERVER'] = 'https://sso.example.org'
app.config['CAS_AFTER_LOGIN'] = 'secure'
# app.config['CAS_LOGOUT_ROUTE'] =
# app.config['CAS_VALIDATE_ROUTE'] =
# app.config['CAS_VALIDATE_ROUTE'] =
```

Thereafter, specific endpoints can be protected and require authentication using Flask-CAS:

{% include googlead1.html  %}

```python
@app.route("/secure")
@login_required
def secure():
    username = cas.username
    attributes = cas.attributes
    return render_template('secure.html', cas=cas)
```

Once after a successful authentication, user profile data and attribtues can be displayed in the web application as part of the `cas` namespace:

```html
<p>Hooray! You are logged in as <b>{% raw %}{{cas.username}}{% endraw %}</b>.</p>
{% raw %}{% if cas.attributes %}{% endraw %}
    <p>The following attributes were released to you:</p>
    <p><em>
        {% raw %}{{ cas.attributes }}{% endraw %}
    </em></p>
{% raw %}{% else %}{% endraw %}
    <p>No attributes were released to you.</p>
{% raw %}{% endif %}{% endraw %}
```

# Demo

Let's run the web application first:

```bash
python app.py
 * Environment: production
   WARNING: This is a development server. Do not use it in a production deployment.
   Use a production WSGI server instead.
 * Debug mode: off
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

Our application home page looks rather modest:

{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/128611160-b7928dc5-1f15-4d68-a4eb-5ba612c30bbe.png" 
width="70%" title="Python Flask-CAS application" %}

After a successful CAS authentication attempt, the user profile can be seen:

{% include googlead1.html  %}
{% include image.html img="https://user-images.githubusercontent.com/1205228/128611270-006fe21b-370c-4c70-a48c-453ca5b02992.png" 
width="70%" title="Python Flask-CAS application" %}

# Need Help?

If you have questions about the contents and the topic of this blog post, or if you need additional guidance and support, feel free to [send us a note ](/#contact-section-header) and ask about consulting and support services.

# So...

I hope this review was of some help to you and I am sure that both this post as well as the functionality it attempts to explain can be improved in any number of ways. Please feel free to [engage and contribute][contribguide] as best as you can.

Happy Coding,

[Misagh Moayyed](https://fawnoos.com)

[contribguide]: https://apereo.github.io/cas/developer/Contributor-Guidelines.html
