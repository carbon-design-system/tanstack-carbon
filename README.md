# Datagrid transition to TanStack Table

Datagrid is one of Carbon's more complex components with very specific
functionality that supports the many aspects of data display and manipulation in
tables. It requires very robust support, testing, and maintenance. The current
Datagrid is not very composable which greatly limits flexibility and
customization for its adopters.

Carbon for IBM Products has been investigating
[TanStack Table](https://tanstack.com/table/latest), a third-party, open-source
offering, which provides extensive data table capabilities surpassing what
Datagrid offers. It provides much more flexibility and customization for
adopters. TanStack Table is headless which means it can easily be added
alongside Datagrid component in your product or application. The benefits of
more flexibility for product teams and less maintenance for Carbon makes it a
win win. Lastly, it is available in multiple frameworks including
[React](https://github.com/carbon-design-system/tanstack-carbon/tree/main/react#readme)
and
[Web Component](https://github.com/carbon-design-system/tanstack-carbon/tree/main/web-components#readme)
so it provides an option to non-React product teams.

For these reasons, we have decided to transition from building our own custom
table component to using an example-based approach with TanStack Table. Datagrid
will still exist in our library for existing teams but we are announcing the
deprecation of the components so teams can begin to work through the transition.
Details about how to use both Datagrid and TanStack together can be found
[here](https://github.com/carbon-design-system/tanstack-carbon/tree/main).
Deprecation means that new features will not be added however sev 1 and sev 2
bugs will be supported.

It is important to note that core Carbon will continue to maintain the basic
[DataTable](https://carbondesignsystem.com/components/data-table/usage)
component.

**What does this mean for your product if you are using Datagrid now?**

Teams can continue to use the existing Datagrid component however we encourage
teams to look at the TanStack Table coded examples which have been created in
both React and Web Components. Instructions regarding how to use the coded
examples alongside Carbon Datagrid can be found
[here](https://github.com/carbon-design-system/tanstack-carbon/tree/main/react#readme).
The Carbon for IBM Products team is available to answer questions if you sign up
for and join the Carbon Developer
[Office Hours](https://teams.microsoft.com/l/meetup-join/19%3ameeting_ZTEzMzEzNTYtODU3NS00OTYyLTkxNDktNmZhMjJiOWEwYzYw%40thread.v2/0?context=%7B%22Tid%22%3A%22fcf67057-50c9-4ad4-98f3-ffca64add9e9%22%2C%22Oid%22%3A%2252bc8219-c7f0-48eb-98b5-3582f96e1fa8%22%7D)
or the [Carbon India Office Hours](https://w3.ibm.com/w3publisher/carbon-india).

Support for continued use of the Datagrid will be limited to sev 1 and sev 2
bugs only and no new features in the current version (v2). In v3, these will be
reduced to sev 1 only.

**When will the transition to TanStack Table take place?**

Carbon for IBM Products **_v2.54.0_** Release on November 20, 2024

- Code examples of TanStack Table available
- [React](https://github.com/carbon-design-system/tanstack-carbon/blob/main/react/README.md)
  or
  [Web Components](https://github.com/carbon-design-system/tanstack-carbon/tree/main/web-components#readme)
- Datagrid marked as deprecated\* in code in
  [Storybook](https://ibm-products.carbondesignsystem.com/?globals=viewport%3Abasic&path=%2Fstory%2Foverview-welcome--overview)

\*_Deprecated means support will be limited to sev 1 and 2 bugs only and no new
feature requests._

Carbon for IBM Products **_v3_** - date tbd

- Datagrid code remains deprecated, no new feature requests, and sev 1 bugs only

Carbon for IBM Products **_v4_** - date tbd

- Datagrid code will be removed entirely

**What are the benefits of TanStack Table over Carbon's Datagrid?**

TanStack Table is an open source headless library that allows you to bring your
own components to build complex tables. Where Datagrid assumed control over
certain areas and is quite opinionated, this new approach flips the model such
that the adopter has the flexibility to build complex tables that will best
suite their own needs. This means the customization is in your control. It also
offers Web Components option for products or applications that are not built
with React.

**Does my product have to stop using Datagrid now?**

No, the transition to start using TanStack Table can be incremental. In other
words, Datagrid can remain in place and TanStack Table code be added as well. If
your product was waiting on a feature to be built, try adding the coded example
that matches that feature request. We have tested to ensure they are
interoperable but, of course, reach out in slack #ibmproducts-pal-dev if you are
having any problems, join our office hours, or open an issue in our GH repo.

**Where can I go for help?**

- Slack,
  [#ibmproducts-pal-dev](https://ibm.monday.com/docs/7813966452?blockId=875b88f2-bdc8-4145-9fa9-eed010752d69)
- [Carbon Developer office hours](https://ibm.monday.com/docs/7813966452?blockId=c9476290-0cd9-409f-a53d-98f6e4328a94)
- [Open an issue](https://ibm.monday.com/docs/7813966452?blockId=6646eeea-812a-4c6b-9175-771dac1bfa5e)
