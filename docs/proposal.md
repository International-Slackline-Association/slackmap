# Slackmap V2 Proposal


## Intro

Slackmap v1 was developed by Piotr Błaszczak since forever. The Platform is userfed with line-data and has several tousand entries so far. Piotr stopped developing the platform in 2018 due to outdated stack and a shift in interests, the platform remains working with some major flaws that make further usage inconvenience (deletion of lines is not possible, line management not allowed, access restrictions can not be communicated, etc.)

## Project Scope

In broader concept, Slackmap v2 aims to:
- Act as a "topo" guide
- Provide global information for travelers
- alleviate access issues
- Form a contact between slackliners in interest and the regional communities & authorities (managers of the spot etc)
- It does **NOT** provide any `social media` oriented features where people can organize meetings, festivals, inform each other about the currently-active gatherings.

## Project Concerns

- Simplicity. It must focus on simplicity both in technical and presentational aspects simply because,
  - It needs to survive potentially decades with volunteered effort which requires long lasting motivation and organization and therefore minimal effort for everybody
  - It will receive countless requests and changes over time.  The maintenance will be an exponential burden as time goes on.
- The Tech Stack must be build on mainstream tools.
  - Its easier to on board volunteers when the tech stack follows the mainstream trends. It helps with motivation, learning curve etc...

## General concepts/entities 

- **Line:** A single line having sub-features
  - Type, ex: highline, waterline
  - Name
  - Anchors and access to anchors
  - Gear and line specs
  - Bolting and first rigger (opened by)
  - Media files like photos or videos
  - Contact information, ex: local club
  - Access details
  - Restriction details
- **Area/Spot:** A groupings of several lines having sub-features
  - Name
  - Contact information, ex: local club
  - Access details
  - Restriction details
- **User:** An individual ISA registered user or a ISA member club(described below) having features
  - name surname
  - country
  - clubs and association list that is member of

## ISA User System
There has to be a user management system (currently facebook etc is used) but other projects like ranking list also requires the same, therefore a single user system for entire ISA products is the most sensible option, where people
- can use single email-password to login to their profiles
- can be assigned to multiple associations and clubs.
- can register on behalf associations and share their credentials inside their clubs to give permissions to their members to maintain their lines and spots etc. 

**This user system is out of the scope for slackmap. It will be carried out separately.**

## Initial Functionalities
- Users can edit all the information related to a line or spot
- Users who initially create the line/spot will be the `owner` of the entity,
  - Other users can request temporary permissions to edit the line/spot info.
  - Owners can confirm or reject the permission request. It will be preferable that the local associations are the owner of the line/spots(ex: they will be informed via mail to give permission to user X for editing line X for 7 days)
  - Owners can transfer the ownership to the other users (in case they are not related to the entity anymore, or wanna transfer to local association)
- User will directly have edit permissions if the line/spot is owned by the association the are member of, otherwise request permissions from the owner. 
- User can query the line/spots based on
  - line/spot name, country, owner-name
- Map interface with minimal obstruction in the screen where people can navigate on the map to get an overview.
- Map offers a good quality satellite images
- Line/Spot creating and editing happens in separate page instead of a popup to provide a clear space to work on.
- Line and Spots are marked distinctively in the map.
- Creating the line supports drawing line on the map interactively with automatic distance measurement
