---
layout:     post
title:      Busting the Myth - GA Release
summary:    Musings on the trustworthiness of a general availability (GA) release and its production-readiness calibre in open source. 
tags: ["Miscellaneous"]
---

<div class="alert alert-success"><i class="far fa-lightbulb"></i> This blog post was originally posted on <a href="https://github.com/apereo/apereo.github.io">Apereo GitHub Blog</a>.</div>

If you are a member of an open source community, currently waiting for something to be *officially* tagged as a GA release so you can begin planning your production deployments and schedule, this post is for you.
{% include googlead1.html  %}
You are holding it wrong.

# The GA Release

A GA release is typically the last step in the software release life cycle. It is the point where the overall developer and user communities have reasonable confidence in the viability of the software and consider the release physique to generally be in a good-enough shape.

How is a release beaten into shape?

{% include googlead1.html  %}

A GA release typically follows after one or more *release candidates*. The release candidate is a beta version of the software with potential to be a final product unless significant bugs are discovered during trials. Release candidates provide opportunities for the community to begin testing new and old product features to the extent and interest reasonable, until show-stopper defects are all evaluated and possibly removed.

# To GA or Not to GA

There are a number of risky assumptions made about GA releases that typically end up affecting the overall [production] deployment schedule in negative ways. Here is what I have learned.

## No Magic

Some deployments tend to consider a GA release as "This is good to go". This statement may be true in larger communities (and not even then) with many active participants, testers and enthusiasts who get involved and step forward to test features, troubleshoot and diagnose issues, provide feedback and patches. After all, that's how one develops confidence for a release, right? *"This was tested by 20 people and in the end they were all found with a smile on their face."* 
{% include googlead1.html  %}
If your community and your membership does not filter through those parameters and yet you're planning your production rollouts and schedules based on the availability of that release, I promise, you have set yourself up for surprises. Of course, some tend to assume that confidence in a given release somehow stems from the deep chasms of the Misty Mountains. While an avid hiker myself and having not visited the place for certain, I find that claim to be suspicious.

A GA tag is just a tag. That's all....Yes, it's just a tag. It holds no magical powers. Really.

If you are waiting for some version of some software to become *stable* particularly by waiting around for all bugs to shake out (for more on this exact subject please see below), it would be practical to ask:

1. Who is making the software more stable?
2. How is the software made stable?
3. Who is testing the software, and who are the folks with seemingly unlimited access to time, money, and energy that are fixing issues and stablizing builds?
4. Why are they doing it? What is their motiviation and how long does that last? How is it that they can do it and I cannot?
5. Is it really true that we can sit back and relax while certain other strangers on the internet keep fixing stuff for *us*? How do we know they are fixing stuff that we care about? and how do we know they are testing the stuff we care about? Do we? really?

If your answer to the above is, *I don't know*, you're most likely going to very expensively surprised.

## Love Thyself

I might be stating the obvious here...

>The only person that really cares about you...is you.

Why does that matter and how is that relevant?

{% include googlead1.html  %}
Sigh. This is my least favorite thing to jot down. Here's how it goes:

1. You are waiting for *others* (developers, beta testers, goblins, etc) to test features before it's to become GA.
2. Others are waiting for you and *others* to test features before it's to become GA.
3. Tail-recursion back to #1.

Something eventually breaks that cycle; it's usually the release schedule. Most development communities find themselves saying *"We have tested what we could. Nobody else has reported anything. It's been 6 months. This is good-enough"*.

Do not put yourself in situations where you have to face the question of the falling tree not having any witnesses. Your time is better spent elsewhere on other things...like testing! Users, contributors and developers all work on and test stuff *they* care about. That might not be similar to your tests, and they might have a very different definitions of *care* and *quality*, which are often driven by time and money. To be exact, not your time. Not your money.

Any piece of open-source software in particular that is subject to some variant of the Apache v2 or MIT license requires that you gain confidence in a release by starting early and experimenting with release candidates and/or follow-up snapshot releases. In terms of stability, all versions are loosely based on the Schrödinger's Cat theory: there are no guarantees until you open the box. Software distributed under the project license is distributed on an "AS IS" basis without warranties or conditions of any kind, either express or implied. 

In short, the only person that can decide if the software is stable is you, and likewise, you're the only person that can make it so by either fixing it or paying someone to fix it for you. Waiting around for random strangers on the internet to tell you good news or sob stories is only going to end-of-life your deployment very quickly. If you hang around, it's entirely possible that at some point all features are bug-free and all deployments are success stories, but that is a decision entirely driven by luck, fantasy and hope. 

...and hope is not a strategy. Your CIO might agree.

# OK. What Now? 

In short, I have learned that early involvement is tremendously valuable. Sure, it is very helpful to rely on others' vote of confidence and make plans. It's immensely better if YOU are that confidence.

[Misagh Moayyed](https://fawnoos.com)
