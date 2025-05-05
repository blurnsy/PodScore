# Podiary Profile Page PRD

## Overview
This document outlines the requirements for transforming the current Podiary homepage into a user profile page similar to Letterboxd's profile layout while maintaining existing functionality.

## Background
The current Podiary homepage displays podcast episodes and reviews in a content-focused layout. The goal is to create a more user-centric experience with a dedicated profile page that showcases user activity and preferences while preserving core functionality.

## Goals
- Create a user profile page as the central hub for user identity and activity
- Maintain existing podcast discovery and review functionality
- Improve user engagement through personalized profile features
- Follow Letterboxd's clean design principles while maintaining Podiary's brand identity

## User Stories
- As a user, I want to have a personalized profile page so others can see my podcast preferences
- As a user, I want to display my podcast listening statistics to share my interests
- As a user, I want to showcase my favorite podcasts to recommend them to others
- As a user, I want to see my recent activity to track my listening habits
- As a user, I want easy access to manage my reviews from my profile

## Requirements

### 1. Profile Header Section
- **User Avatar** - Large circular profile image (default placeholder if none uploaded)
- **Username** - Prominently displayed next to avatar
- **Edit Profile Button** - Similar to Letterboxd's "EDIT PROFILE" button
- **Profile Stats** - Three key metrics displayed horizontally:
  - Number of podcasts listened to
  - Number of users following
  - Number of followers
- **Action Menu** - Additional profile actions (represented by "..." button)

### 2. Navigation Bar
- Horizontal navigation menu with the following tabs:
  - Profile (default selected)
  - Activity
  - Episodes (renamed from "New Episodes")
  - Diary (for listening log)
  - Reviews
  - Watchlist (renamed to "Listen List")
  - Lists (for curated podcast lists)
  - Likes
  - Tags

### 3. Favorite Podcasts Section
- Heading "FAVORITE PODCASTS"
- Grid display of podcast cover art (3-4 per row)
- Placeholder text if no favorites selected: "Don't forget to select your favorite podcasts!"
- Link to add/edit favorites

### 4. Recent Activity Section
- Heading "RECENT ACTIVITY" with "ALL" link to view complete history
- Grid of recent actions (listened to podcasts, reviews, likes, etc.)
- Each activity card shows podcast image and action details
- Empty state design for users with no activity

### 5. Following Section
- Heading "FOLLOWING" with count indicator
- Horizontal scrollable list of users being followed
- Avatar images linking to followed users' profiles
- Link to view all following

### 6. Sidebar Elements (Right Column)
- Profile upgrade promotion (if applicable)
- Activity feed showing recent social interactions
- Recommendations based on listening history

## Technical Requirements
- Responsive design that works on mobile and desktop
- Maintain existing backend functionality for reviews and episodes
- Reuse authentication and user data systems
- Implement proper routing between profile and other pages

## Implementation Phases

### Phase 1: Basic Profile Layout
- Create profile header with avatar and username
- Implement basic stats display
- Add navigation bar
- Maintain existing functionality for Episodes and Reviews sections

### Phase 2: Enhanced Profile Features
- Implement Favorite Podcasts section
- Create Recent Activity grid
- Add Following section
- Design and implement empty states

### Phase 3: Social Features and Polish
- Add activity feed to sidebar
- Implement social interactions (follows, likes)
- Add recommendations
- Final UI polish and responsiveness

## Metrics for Success
- User profile completion rate
- Engagement with profile features (favorites added, etc.)
- Navigation efficiency (fewer clicks to access common functions)
- Overall user satisfaction (measured through feedback)

## Design Considerations
- Maintain Podiary's existing color scheme and branding
- Use Letterboxd's clean, minimal aesthetic as inspiration
- Focus on podcast cover art as the primary visual element
- Ensure typography is consistent with existing brand guidelines

## Constraints
- Must support all existing functionality
- Backward compatibility with current user data
- Must work on all screen sizes and major browsers
- Should not require significant backend changes