---
layout: default
id: index
title: What is Relate
next: how-it-works.html
---

Relate is an extension of the redux connect which resolves your data needs automatically and provides it to your wrapped component.

Relate follows a similar API to [Relay](https://github.com/facebook/relay), this project isn't supposed to replace it but is more of an alternative to it. The main difference between them are:

* **Relate is agnostic to your schema**, which means you don't have to alter your schemas to use it.
* **Relate uses Redux and extends React Redux**, if you use these techs in your project already, it'll be a perfect fit.
* Since it uses Redux **you can capture queries and mutations in other reducers** and process them in other ways.
* Fragments are not specified as GraphQL notation but as a plain object.
* Server side rendering (In progress)
