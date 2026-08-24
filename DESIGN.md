Bibliotecas Populares Córdoba — Design System & Visual Direction
1. Context
Bibliotecas Populares Córdoba is a web platform designed to connect the community of Córdoba, Argentina, with its network of public/community libraries ("bibliotecas populares").
The current application uses:
Backend: Node.js + Express
Frontend: React
Styling: Tailwind CSS
Maps: MapTiler
Database: MongoDB
The frontend was recently migrated from EJS server-rendered views to React components.
This document defines the visual direction for the next stage of the project: redesigning the existing interface without unnecessarily changing its architecture or introducing functionality that does not currently exist.
Also, the PNG files for visual reference shows BiblioRed as title, this should be modified to Bibliotecas Populares Córdoba (in every case).
The Stitch/Figma screens are the primary visual reference for this redesign.

2. Design Goal
The goal is to transform the current interface into an experience that feels:
modern;
warm;
immersive;
cultural;
geographic;
coherent;
memorable.
The interface should communicate that Bibliotecas Populares Córdoba is not simply a list of libraries, but a way to discover cultural and community spaces.
The visual language should feel contemporary while remaining human and approachable.
Visual Concept
Lumina Solis — Sunset
The visual identity is inspired by the warm light of sunset: oranges, amber, terracotta, and earthy tones combined with dark surfaces and translucent elements.
The aesthetic should avoid:
generic dashboard aesthetics;
overly cold SaaS interfaces;
excessive gradients;
excessive shadows;
visually saturated layouts;
generic Tailwind template aesthetics.

3. Visual References
The screens designed with Stitch and subsequently refined in Figma are the primary visual references for this redesign.
Reference screens include:
Home
Index
Library-details
Login
Contact
The reference images are stored in:
design/new-look/

These screens should be used to understand:
composition;
visual hierarchy;
color treatment;
typography;
header;
footer;
cards;
buttons;
surfaces;
spacing;
map treatment;
interaction patterns.
Important
The reference screens do not imply that every feature shown in them must be implemented now.
Some screens may contain concepts such as:
Events;
Collections;
Members;
reservations;
advanced catalogs;
statistics;
or other functionality that does not currently exist.
These should be treated as future product direction and visual references, unless the current task explicitly requires implementing them.
Do not invent functionality merely to reproduce the reference screens literally.

4. Visual Identity — Lumina Solis
4.1 Primary Colors
Orange
#EA580C

Primary uses:
CTAs;
active navigation;
highlights;
map markers;
interactive states;
important icons;
highlighted links.
Terracotta
#A33900

Uses:
darker variations of the primary color;
hover states;
emphasis;
visual details.
Amber
#B45309

Uses:
secondary accents;
complementary states;
warm visual details.
Earth Tones
Use warm, natural earth tones for backgrounds and content surfaces.
Avoid relying exclusively on pure white.

5. Typography
The primary typeface is:
Plus Jakarta Sans
Desired characteristics:
modern;
geometric;
highly legible;
friendly;
contemporary.
Maintain a clear typographic hierarchy.
Display / Hero
Large, strong headlines with high visual impact.
Headings
Use semibold/bold weights.
Body
Use regular/medium weights.
Metadata
Use smaller sizes and lower visual contrast.
Avoid introducing multiple font families.
The interface should maintain a consistent typographic identity across all pages.

6. Overall Visual Language
The interface combines:
warm, light surfaces;
dark surfaces;
orange/terracotta as the action color;
glassmorphism primarily in navigation;
rounded corners;
elevated cards;
large imagery;
maps as visual focal points.
The aesthetic should feel premium but accessible.
Glassmorphism should be used selectively.
Do not turn every UI element into a translucent surface.

7. Header / Navigation
The header is one of the main elements responsible for visual consistency across the application.
Main application pages should share a consistent header.
Desktop
The reference structure is:
┌───────────────────────────────────────────────────────────────┐
│  Bibliotecas Populares Córdoba       Navigation                Actions           │
└───────────────────────────────────────────────────────────────┘

Visual characteristics:
pill-shaped container;
dark background;
partial transparency;
glassmorphism effect;
subtle borders/shadows;
clear separation from the page content.
Logo
Display:
Bibliotecas Populares Córdoba
The logo should act as a primary identity element.
Navigation
The reference design uses:
Explore
Collections
Events
Members
These represent the future product direction.
Do not implement navigation to nonexistent functionality unless explicitly requested.
For the current application, preserve only existing routes and functionality.
Active State
The active navigation item should use:
#EA580C

with a clear visual indicator such as an underline or highlight.
Actions
The reference design uses icons for:
search;
notifications;
user/profile.
Maintain this visual language when these actions exist functionally.
Do not add decorative icons that imply nonexistent functionality.

8. Authentication Header
Authentication screens may use a simplified header.
The login experience should still feel like part of the same visual system, but it does not need to use the full application navigation header.
This establishes a clear distinction between:
application navigation;
authentication flows.

9. Footer
All main pages should share a consistent footer.
Reference structure:
Bibliotecas Populares Córdoba                             LinkedIn profile (Desarrollado con ♥ por Pablo Peralta)
Copyright                             
Rules
use the same structure across pages;
maintain consistent typography;
maintain consistent spacing;
align links consistently;
use dark/earth-tone surfaces compatible with Lumina Solis.
Link names must correspond to real application functionality.
Do not add links to pages that do not exist.

10. Home / Hero
The Home page should use the map and geographic context as important parts of the visual identity.
The Hero should communicate the project's purpose quickly and with strong visual impact.
Reference headline:
Discover the heartbeat of your community
The reference includes:
map;
headline;
description;
quick search;
network statistics.
Statistics should only be implemented when real data is available.
Do not use fabricated numbers merely to reproduce the reference design.

11. Library Index
The Library Index is currently one of the main screens of the application.
It should preserve the existing functional structure:
Map
   ↓
Search / Filters
   ↓
Library results
   ↓
Library grid

The redesign should improve presentation without breaking:
search;
filters;
results;
navigation;
map interaction;
responsive behavior.

12. Map
The map is a central element of the user experience.
The application uses the MapTiler API.
The real MapTiler map must remain part of the new visual system.
Important
Do not replace MapTiler with a static image or simulated map.
The map must remain functional.
The map styling and surrounding UI should complement the Lumina Solis identity.
UI elements placed over the map may use:
dark surfaces;
glassmorphism;
#EA580C;
terracotta;
earth tones.

13. Map Markers
Map markers should be part of the visual identity.
Recommended primary color:
#EA580C

Default
Orange marker.
Hover
Slightly increased scale/elevation.
Selected
Higher contrast and/or increased size.
The ideal interaction model is:
Library Card
      ↕
Map Marker

When supported by the existing architecture:
card hover → highlight corresponding marker;
card selection → center map on marker;
marker selection → highlight corresponding library card.
Do not introduce a major architectural refactor solely to implement this interaction if the existing infrastructure does not support it naturally.

14. Library Cards
Cards are one of the main visual elements of the site.
They should feel:
dynamic;
warm;
visual;
easy to scan.
Card Anatomy
A card may contain:
┌─────────────────────────┐
│                         │
│         IMAGE           │
│                         │
├─────────────────────────┤
│ Library name            │
│ Location / neighborhood │
│ Description / metadata  │
│                         │
│ CTA                     │
└─────────────────────────┘

Visual Treatment
Use:
consistent border radius;
large imagery;
clear contrast;
generous spacing;
subtle shadows;
hover elevation;
smooth transitions.
Hover
Possible effects include:
elevation;
slight translation;
shadow change;
image transition;
border highlight.
Avoid exaggerated animations.

15. Search / Sidebar
Search should be a central part of the discovery experience.
It should feel visually integrated with the map and library cards.
The reference design uses elevated and/or translucent surfaces.
Priorities:
usability;
visibility;
clear hierarchy;
responsive behavior.
The sidebar should not visually overpower the map.
On desktop it may function as a side panel.
On mobile it should adapt to the available space, for example as:
a drawer;
collapsible section;
expandable search/filter panel.
The implementation must preserve the existing search and filtering functionality.

16. Library Detail
The Library Detail page should use the same visual language.
It may display information such as:
library name;
location;
description;
opening hours;
contact information;
services;
images;
activities.
The reference design should guide:
hierarchy;
spacing;
image treatment;
buttons;
metadata.
Do not add functionality that does not currently exist.

17. Responsive Design
The reference designs are primarily Desktop-oriented, but the implementation must be responsive.
Desktop
Prioritize:
large map;
library grid;
sidebar;
horizontal navigation;
spacious composition.
Tablet
Adapt:
number of columns;
sidebar width;
spacing;
navigation.
Mobile
Prioritize:
vertical content flow;
compact navigation;
accessible search;
full-width cards;
controlled map height;
touch-friendly controls.
Do not attempt to preserve the Desktop layout literally on Mobile.

18. Spacing
Use the existing Tailwind spacing system whenever possible.
Avoid arbitrary values unless necessary.
The interface should maintain:
consistent padding;
consistent gaps;
vertical rhythm;
clear section separation.
Whitespace is an important part of the visual identity.

19. Border Radius
Rounded corners are an important part of the visual language.
The reference design primarily uses:
rounded cards;
rounded controls;
pill-shaped navigation;
rounded buttons.
Maintain consistency.
Avoid mixing many unrelated radius values.

20. Shadows & Elevation
Shadows should remain subtle.
Use elevation primarily for:
cards;
panels;
floating controls;
header;
elements positioned above the map.
Avoid heavy shadows.
Depth should feel modern and clean.

21. Motion
Interactions should use smooth, restrained transitions.
Recommended uses:
card hover;
marker hover;
buttons;
navigation states;
panel transitions;
content appearance.
Prefer short and subtle animations.
Avoid:
constant motion;
distracting animations;
excessive parallax;
motion that harms accessibility.
Respect prefers-reduced-motion when possible.

22. Accessibility
The visual redesign must not reduce accessibility.
Maintain:
sufficient contrast;
visible focus states;
keyboard navigation;
clear labels;
adequate touch target sizes;
semantic HTML;
meaningful image alt text;
visible interactive states.
Do not rely exclusively on orange to communicate state.

23. Component Strategy
The redesign should leverage the existing React architecture.
Prioritize reusable components such as:
Header
Footer
Map
Search
Filter
LibraryGrid
LibraryCard
MapMarker
Button
Badge
SectionHeading

Do not duplicate markup across pages when a shared component makes sense.
Before creating a new component, check whether an equivalent component already exists.

24. Tailwind CSS
Use Tailwind CSS as the primary styling mechanism.
Preferences:
use existing Tailwind utilities;
leverage the spacing system;
reuse design tokens;
maintain consistency;
avoid unnecessary custom CSS.
Do not introduce another UI framework unless explicitly requested.
Do not replace Tailwind with CSS-in-JS.

25. Design Tokens
Primary identity values:
Primary Orange:      #EA580C
Terracotta:          #A33900
Amber:               #B45309
Font:                Plus Jakarta Sans

Additional earth tones should remain within a warm, natural color range.
Whenever possible, centralize these values in the Tailwind configuration or CSS variables instead of scattering arbitrary values throughout the codebase.

26. Content & Language
The application is targeted at users in Córdoba, Argentina.
Functional application content should remain in Spanish where appropriate.
The Stitch references contain some English labels, such as:
Explore
Collections
Events
Members
Privacy Policy
Terms of Service
Library Locations
Contact Us
These labels are part of the visual reference, not an instruction to change the application's language.
Preserve the actual localization and content conventions of the current project.

27. Scope of This Redesign
In Scope
visual redesign;
typography;
colors;
spacing;
cards;
header;
footer;
search UI;
sidebar;
map presentation;
map markers;
responsive layout;
hover states;
transitions;
visual consistency.
Out of Scope Unless Explicitly Requested
Events system;
Collections system;
Members system;
reservations;
new authentication flows;
new database models;
new API endpoints;
major backend refactoring;
replacement of MapTiler;
unrelated security changes.
The goal of this phase is to improve the visual experience and UX of the existing application, not to turn the redesign into a complete product rewrite.

28. Implementation Principles for OpenCode
1. Inspect Before Modifying
First analyze:
existing React structure;
existing components;
routes;
Tailwind configuration;
MapTiler integration;
state management;
search;
cards;
responsive behavior.
Do not assume the project structure based only on this document.
2. Preserve Existing Functionality
The redesign must not break:
navigation;
search;
filters;
authentication;
maps;
data;
forms;
API integrations.
3. Reuse Existing Components
Modify and extend existing components before creating duplicates.
4. Do Not Invent Functionality
The reference screens contain concepts representing future functionality.
Implement only what currently exists or what the task explicitly requests.
5. Follow the Visual System
When a visual decision is not explicitly specified, prioritize:
Stitch/Figma visual references;
Lumina Solis identity;
consistency with existing components;
accessibility;
simplicity.
6. Prefer Incremental Implementation
Implement the redesign in stages.
Suggested sequence:
1. Design tokens
2. Typography
3. Header
4. Footer
5. Buttons / common UI
6. Library cards
7. Search / sidebar
8. Map integration styling
9. Library Index
10. Library Detail
11. Responsive refinement
12. Motion / micro-interactions
13. Visual QA

7. Review Before Large Refactors
If a visual improvement requires a significant architectural change, analyze the impact first.
Do not perform large refactors simply to reproduce a visual reference.

29. Definition of Done — Visual Redesign
The redesign can be considered visually complete when:
Lumina Solis identity is applied consistently.
Plus Jakarta Sans is correctly integrated.
Header and footer are consistent across pages.
Cards share a common visual language.
Search/sidebar is visually integrated with the map.
MapTiler functionality remains intact.
Map markers use the visual identity.
Hover/focus states are consistent.
Desktop layout is properly implemented.
Mobile layout is properly adapted.
No fictitious functionality has been added.
Existing functionality has not been broken.
Unnecessary visual component duplication has been avoided.
Basic accessibility requirements are respected.
The implementation has been visually compared against the Stitch/Figma references.

30. Final Design Principle
Bibliotecas Populares Córdoba should feel like a living cultural map of Córdoba, not a library dashboard.
The map, Lumina Solis warm lighting, library imagery, and discovery interactions should work together to create an experience that invites users to explore.
Technology should remain invisible to the user.
The interface should feel:
warm · geographic · cultural · modern · accessible · human
