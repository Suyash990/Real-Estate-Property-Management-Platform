
# NestKey – Property Listing Page

## About the Module

The Property Listing Page is an individual module of NestKey – Real Estate Property Management Platform.

It allows users to explore rental properties, search according to their requirements, apply filters, compare properties and view complete property details.

## Features

- Property search by name, location and description.
- Quick location search for popular cities.
- Filters by property type, bedrooms, budget, furnishing, availability and amenities.
- Sort properties by rent, area and recommendations.
- Dynamic property cards.
- Add or remove favourite properties.
- Compare up to three properties.
- View complete property details in a popup.
- Recently viewed properties.
- Property insights such as average rent, lowest rent and property count.
- Load more properties.
- Share property links.
- User notifications and API error handling.

## Technology Stack

- HTML5 – Page structure.
- CSS3 – Styling and responsive design.
- JavaScript – Functionality and dynamic content.
- JSON Server – Mock REST API.
- LocalStorage – Saving favourites and recently viewed properties.

## Project Structure

```text
listing page/
│
├── listing.html
├── listing.css
├── listing.js
├── db.json
├── package.json
├── package-lock.json
└── README.md
```

## How to Run the Project

### Prerequisites

- Node.js
- Visual Studio Code
- Live Server extension

### Installation

Open the project folder in VS Code and run:

```bash
npm install
```

### Start JSON Server

```bash
npm run server
```

The API will be available at:

http://localhost:3000/properties

### Run the Website

1. Keep JSON Server running.
2. Open `listing.html` in VS Code.
3. Right-click and select Open with Live Server.
4. The property listings will load from JSON Server.

## Data Storage

- Property records are stored in `db.json`.
- JSON Server provides property data through a REST API.
- Favourite properties and recently viewed property IDs are stored in browser LocalStorage.
- Comparison selections are maintained in JavaScript while the page is open.

## Developer

Individual Contribution: Property Listing Page

Project: NestKey – Real Estate Property Management Platform
