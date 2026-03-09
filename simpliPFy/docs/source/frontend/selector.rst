Selector
==========

A selector is a wrapper for the combination of an accordion that has a carousel in each of its
elements. To use the bootstrap functionality of an accordion it needs unique ids. The selector class
generates unique ids to avoid id collision.

How the ids are generated
__________________________

The main div gets an id that starts with ``acc`` and is appended by an index that is incremented
with each created selector e.g. the first one has the id ``acc-0``. Each id inside the accordion starts
with the id of the main div. Across the accordion the id are appended to describe the according
part of the accordion e.g. ``acc-0-item-res`` describes the accordion 0, the an item of the accordion,
in the carousel of the item are the circuits that are stored in the resistors folder in the circuit zip.

The body of the accordion item is appended by ``body`` e.g. ``acc-0-item-res-body``.

An element that lives inside the carousel inside the accordion body is appended by its index e.g.
``acc-0-item-res-body-0``

Classes used by Selector
-------------------------
The selector uses two classes to delegate functionality:

    - SelectorCarousel
    - CounterManager

Selector Carousel
------------------
Builds the carousel that is displayed inside an accordion item and manages the data, state and events on
the carousel

CounterManager
---------------
Builds the CounterElements that are displayed behind a accordion heading element and manages the data, state and events
on the CounterElements