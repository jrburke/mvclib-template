# Under construction

This is an MVC library project template that assumes the use of jQuery to do
DOM work.

It is meant to be used a project template fetched by [volo](https://github.com/volojs/volo):

    volo create foo jrburke/mvclib-template

This will create a `foo` directory and build an MVC library named foo. The library
does not do anything useful, but demonstrates how a developer could use a
"CommonJS/Node"-like modules for their source code and build one JS file that
can be used by plain scripts or as an AMD module, while still allowing the
source code to be very modular. The source code in `lib` could be used as
an AMD project if the final library source is fetched from GitHub by volo as part
of a `volo add` in an AMD-based project.

To build the lib, type:

    node tools/build.js

If you want the library components to be stored as JS strings and only evaled
when called, do:

    node tools/build.js stringify

This will generate the foo.js file in this directory (if the project was created
with the `foo` name).


## TODO

* better test.html file
* discuss why return would be better instead of module.exports.
* only write path after lib/ for the defStore calls.