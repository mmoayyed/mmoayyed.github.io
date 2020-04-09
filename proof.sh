#!/bin/bash

clear
docker run --name="html-proofer" --rm --workdir /root -v $(pwd)/_posts:/root/docs -v $(pwd)/out:/root/out -v $(pwd)/html-proofer-docs.rb:/root/html-proofer-docs.rb  --entrypoint /usr/local/bin/ruby hdeadman/html-proofer:latest /root/html-proofer-docs.rb
rm -Rf ./out