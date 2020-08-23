---
layout:     post
title:      Validate Generated HTML from Markdown
summary:    In this post, you will learn how to validate and verify your HTML documents that are generated from markdown sources using HTMLProofer.
published: true
tags:       [CAS, MarkDown]
---

If you have a set of Markdown documents hosted somewhere (i.e. [GitHub Pages](https://pages.github.com/)) and rendered in HTML format, it would be a good idea to validate and proof-read them all, to make sure image references, links, tags, etc are all working correctly before you publish. Doing so manually would take a lot of time and is quite a tedious task. So in this blog post, we are going to take a look at the [HTMLProofer](https://github.com/gjtorikian/html-proofer) tool to see how it can be used to validate our markdown documents. 

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

## Requirements

- (Optional) Ruby
- Docker
- Text Editor (Visual Studio Code, Sublime Text, etc)

## How

First, the [documentation](https://github.com/gjtorikian/html-proofer) instructs us to put together a Ruby script that would mainly depend on the `html-proofer` Ruby gem to process our documents. That script, `html-proofer-docs.rb` would be as follows:

```ruby
require 'html-proofer'
require 'html/pipeline'
require 'find'
require 'fileutils'

# make an out dir
Dir.mkdir("out") unless File.exist?("out")

pipeline = HTML::Pipeline.new [
  HTML::Pipeline::MarkdownFilter,
  HTML::Pipeline::TableOfContentsFilter
], :gfm => true

# iterate over files, and generate HTML from Markdown
Find.find("./docs") do |path|
  if File.extname(path) == ".md"
    contents = File.read(path)
    result = pipeline.call(contents)
    dirname = File.dirname(path)
    FileUtils.mkdir_p ("out/" + dirname)
    content_str = result[:output].to_s
    filename = path.split("/").pop.sub('.md', '.html')
    if filename == "sidebar.html"
      content_str = content_str.gsub! '/%24version' '.'
    end
    File.open("out/#{dirname}/#{filename}", 'w') { |file| file.write(content_str) }
  end
end
# url_ignore - ignore links content not in branch
# file_ignore - ignore CAS spec b/c it has lots of bad anchor links, only *.html files are processed
options = {
            :file_ignore =>  [ %r{.*/CAS-Protocol-Specification.html} ],
            :disable_external => true,
            :only_4xx => true,
            :empty_alt_ignore => true,
            :url_ignore => [ %r{^/cas}, %r{^../images/}, %r{^../../developer/} ],
          }
# test your out dir!
HTMLProofer.check_directory("./out", options).run
```

Then, all that is left is to run the script. If you have Ruby installed, you should be able to execute the script directly. Alternatively, I am going to use a Docker image that my colleague, [Hal Deadman](https://github.com/hdeadman) on the [Apereo CAS project](https://github.com/apereo/cas), put together to run the script all via a `proof.sh` file:

```bash
#!/bin/bash
clear
docker run --name="html-proofer" --rm --workdir /root \
    -v $(pwd)/_posts:/root/docs \
    -v $(pwd)/out:/root/out \
    -v $(pwd)/html-proofer-docs.rb:/root/html-proofer-docs.rb \
    --entrypoint /usr/local/bin/ruby \
    hdeadman/html-proofer:latest /root/html-proofer-docs.rb
# rm -Rf ./out
```

The script above assumes that Markdown documents are found in the current directory inside a `_posts` folder which is then mapped onto the running container. HTML files will be generated in an `out` directory and of course, the location of the Ruby script is assumed to also be in the same directory. 

<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block; text-align:center;"
     data-ad-layout="in-article"
     data-ad-format="fluid"
     data-ad-client="ca-pub-8081398210264173"
     data-ad-slot="3789603713"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>

If you run the script, hopefully you will see the following output:

```
Running ["ImageCheck", "ScriptCheck", "LinkCheck"] on ["./out"] on *.html...
Ran on 123 files!
HTML-Proofer finished successfully.
```

Or, you might see errors:

```
  *  (https://pages.github.com/) is an invalid URL (line 8)
     <a href="(https://pages.github.com/)">GitHub Pages</a>
```

If your Markdown documents are technical documentation and manuals, let's say for a project that is hosted on GitHub, you could very easily integrate the above steps into [your CI workflow](https://travis-ci.org/apereo/cas/builds) and automate the validation process for all commits and pull requests. 

## Finale

I hope this review was of some help to you. Be sure to take a look at [HTMLProofer](https://github.com/gjtorikian/html-proofer) and give it a try. Of course, kudos to [Hal Deadman](https://github.com/hdeadman) for putting together the script, the Docker image and the follow-up work that went into the [Apereo CAS project](https://github.com/apereo/cas) to make sure the documentation syntax is kept up to par.

[Misagh Moayyed](https://fawnoos.com)