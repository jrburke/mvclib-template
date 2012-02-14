# mvclib-template

This is an MVC library project template that assumes the use of jQuery to do
DOM work. It came about from these influences

* [I prefer developing close to the metal](http://tagneto.blogspot.com/2012/01/web-dev-with-two-turntables-and.html),
but I appreciate some people like to use sugar and the dependencies it introduces.
* Some feedback from Yehuda Katz in
  [JS Jabber #3](http://javascriptjabber.com/003-jsj-build-tools/)
  about JS module formats and building.

Specifically, I wanted to show how to construct a modular MVC library that:

* works out of the box in Node
* each mvc component is a separate JS file
* Uses a "sugared" module syntax as used in Node
* but it can be used in AMD projects easily, particularly via
[volo](https://github.com/volojs/volo), which will
wrap the Node-like modules in define() wrappers.

First, some details about the project layout, then some benefits of this layout.

## Details

### Dependencies

The only hard dependency is installing [Node](http://nodejs.org/). Everything
else is included in this project.

### Installation

This template can be installed in one of two ways. Assuming you want to create
a library with the name `foo`:

1) With [volo](https://github.com/volojs/volo):

    volo create foo jrburke/mvclib-template

This will create a `foo` directory and for an MVC library named `foo`.

2) Manually:

    * Download the [latest master snapshot](https://github.com/jrburke/mvclib-template/zipball/master).
    * Unpack it, name the directory `foo`.
    * Remove `foo/volofile`.
    * Search for all the references to `LIBNAME` and rename to `foo`.

### Project layout

* **main.js**: the top-level JS file that pulls together the subcomponents into
one object. Its exported value is the one used for the built, "just deliver one
JS file that works with browser globals" output. This main.js is also used
as the "main" property in the package.json that is used by npm and web project
tools like volo.
* **Other JS files**: implement the subcomponents of the library. They are
stored as sibling to main.js so that they can easily be used separately by Node
and AMD projects.
* **tools**: directory containing the build script that runs in Node to generate
the one JS file that can be delivered for "browser globals" projects.
    * **wrap.start** and **wrap.end** implement the immediately executed
    function that sets up the built file to be usable either in an AMD or
    "browser globals" projects.
* **test**: A simple test page the tests the built file's use in a "browser
  globals" project.

### Build options

To build the lib, type:

    node tools/build.js

If you want the library components to be stored as JS strings and only evaled
when called, do:

    node tools/build.js stringify

This will generate the dist/foo.js file (if the project was created
with the `foo` name).

The `stringify` option includes
[@sourceURL](http://blog.getfirebug.com/2009/08/11/give-your-eval-a-name-with-sourceurl/)
support, so you can debug individual components in browsers that support @sourceURL.

## Benefits

While I would code the library in AMD (just wrap each JS file with
`define(function(require) {})` and use `return` instead of `module.exports`),
this project layout was chosen for those that are fine with doing builds for
each source change, and do not want to type the define() function wrapping.

AMD concepts of module separation and wrapping in the built file are still used,
but the built file does not depend on an AMD implementation to run. It will
register with an AMD loader if it is available. It is also set up to be
used in Node in source form. So the project could be published to npm.

Here are some more benefits, specifically to address some concerns that
@wycats brought up in the above-mentioned podcast, and to see how it could also
relate to other MVC-type libraries, like Backbone.

### Fine-grained use

This sort of project layout makes it easy for an app to just pick and choose
the components it actually uses from a library. If an AMD loader
is in play, it is easy to swap out the template engine by mapping the 'template'
module ID to another template engine's path.

Since AMD builders trace dependencies that are used in a project, it is possible
for an app to have the complete source for this MVC lib in their project, but
only ship the pieces it actually uses.

### Exports not heavier than global object assignment

Yehuda mentioned he felt the exports approach used by CommonJS/Node was too
heavy, but I hopefully this project shows that it is not heavier than the
alternative, and it allows fine-grained consumption of only parts of the library.

Specifically, each component uses this pattern to register its value:

    module.exports = value;

In something like a Ember, you would have code like:

    Ember.template = value;

For dependencies, if a module used the model layer:

    var model = require('./model');

as compared to:

    var model = Ember.Object;

The [tools/wrap.start](https://github.com/jrburke/mvclib-template/blob/master/tools/wrap.start)
file shows the implementation used for require and module.exports. They are
quite small. That header is even smaller if the "eval strings" build approach
is not used (so the STRINGIFY sections would be removed from wrap.start).

The main.js file gives a nice way to list out how the entire structure of
the library if it was to be used as one built JS file, but still keep the
individual components contained and usable on their own.

Not all the components need jQuery. By only requiring it for
the components that need it, it makes it clear what parts of the library can
be used effectively in a non-browser environment.

### Applications to Backbone

These same benefits apply to Backbone. In particular, I find it awkward right
now that for usage in Node, 'jquery' cannot be mentioned as a dependency because
it would fail for the server uses of Backbone. It would be clearer if the pieces
that use jQuery were separated from the other components and if they explicitly
stated their jQuery dependency.

It is also awkward that Backbone has a list of DOM libraries that it will use
for $:

    var $ = root.jQuery || root.Zepto || root.ender;

and it needs a `Backbone.setDomLibrary()` to allow other options. With AMD,
it would mean just mapping 'jquery' to the DOM library the user wants to use.

There are benefits gained by using APIs that work across libraries without
requiring each of them to make up their own.

### Use in AMD projects

While the source files do not use AMD in their source, this project was
constructed so that it could be easily integrated into AMD projects.

In particular, if you use
[volo add](https://github.com/volojs/volo/blob/latest/vololib/add/doc.md),
you could fetch this project for an AMD app, and volo will add the dependency
and convert the JS files to have the define() wrappers. It will do so without
introducing any new configuration in your app -- it just uses the normal AMD
path conventions.

## Summary

I would code this library in AMD to start, so I do not need to do
builds and eval tricks to develop. I would rely on build tools
to replace define() usage with smaller shims for internal structure, but still
use standard AMD APIs to target these shim replacements.

For people that like sugar and doing builds during development, hopefully this
sample project shows an standard approach that could be used.

Plus, as hopefully demonstrated, Node works great as a build tool. Yehuda is
correct that the default Node APIs that encourage async work can be awkward,
but I think those are solvable by higher APIs as provided in tools like volo
or grunt. Plus, I believe using JavaScript for these tools will be more
acceptable to the entire spectrum of JS developers. It needs some work to build
up, but it is achievable.

