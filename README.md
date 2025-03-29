# Visualizing East Bay Punk (vebp)

A suite of web applications to visualize various elements of the East Bay punk scene. This project can be repurposed for the analysis of other music scenes.

---

## Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Installation and Setup](#installation-and-setup)
- [Sections and Usage](#sections-and-usage)
  - [People](#people)
  - [Places](#places)
  - [Words](#words)
  - [Shows](#shows)
  - [Gilman](#gilman)
- [Customization and Repurposing](#customization-and-repurposing)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

This project comprises a set of interconnected web applications that together provide a set of visualization of the East Bay punk scene. 

- **People:** An interactive network graph showing bands and individual members along with their connections.
- **Places:** An interactive map that visualize key locations tied to the scene.
- **Words:** A  visualization of lyrics from Lookout Records releases, featuring a word cloud, association networks, and a randomizer.
- **Shows:** A searchable, filterable historical database of punk events in the Bay Area, displayed in a responsive table with pagination.
- **Gilman:** An interactive network graph specifically focused on bands that performed at the Gilman Street Project, with node sizes and edge thicknesses representing performance frequency and shared shows.

The suite is built using HTML5, CSS3, JavaScript, D3.js, vis-network, and PHP for backend APIs and is designed to be easily repurposed for different scenes by updating the data and customizing visual parameters.

---

## Repository Structure

```
vebp/
├── people/
│   ├── people.html          # People network visualization 
│   └── merged-json.json     # JSON data for bands and members
├── places/
│   ├── places.html          # Interactive map for scene locations (ArcGIS embedded map)
│   └── locations_latlong_split.csv   # CSV data with latitude/longitude info
├── words/
│   ├── words.html           # Main interface for lyrics visualization and word cloud (d3-cloud)
│   ├── songs.json           # Album and track data with lyrics for Lookout Records
│   ├── missing_lyrics.json  # JSON data for tracks missing lyrics
│   ├── missing-lyrics.html  # Interface to display and invite missing lyrics submissions
│   ├── api.php              # PHP API file (backend)
│   ├── getAlbumDetails.php  # PHP API file for album details
│   ├── getAlbums.php        # PHP API file for albums
│   ├── getAllTracks.php     # PHP API file for track data
│   └── ingest.php           # PHP API file for data ingestion   
├── shows/
│   ├── shows.html           # Table for Bay Area punk events search with filters & pagination
│   └── events.json          # JSON file with event data 
├── gilman/
│   ├── gilman.html          # Network visualization for 924 Gilman shows (vis-network)
│   └── weighted-bands.csv   # CSV file with weighted data on band performances at Gilman                   # 
```

---

## Installation and Setup

### Requirements

- A web browser with JavaScript enabled.
- A web server capable of serving static files (Apache, Nginx, or a local development server such as Python’s HTTP server).
- PHP (if you wish to run the backend APIs).

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/smorello87/vebp.git
   cd vebp
   ```

2. **Install Dependencies:**

   This project uses external libraries loaded via CDN (e.g., D3.js, vis-network, Bootstrap). No additional package installation is required for front-end dependencies.

3. **Configuration:**

- Ensure that data files (CSV, JSON) and HTML files for each section are in the expected directory structure.
   - For the PHP API scripts in the **words/** folder, configure your server to execute PHP and update any necessary database credentials. For example, the Words section requires a MySQL database. If needed, create the database and tables:

     ```sql
     CREATE DATABASE music_label;
     USE music_label;
     CREATE TABLE albums (
         id INT AUTO_INCREMENT PRIMARY KEY,
         title VARCHAR(255) NOT NULL,
         year INT
     );
     CREATE TABLE tracks (
         id INT AUTO_INCREMENT PRIMARY KEY,
         album_id INT,
         title VARCHAR(255) NOT NULL,
         artist VARCHAR(255),
         lyrics TEXT,
         FOREIGN KEY (album_id) REFERENCES albums(id)
     );
     ```

4. **Running the Application:**

   - Open the desired HTML file (e.g., `people.html`, `places.html`, `words.html`, `shows.html`, or `gilman.html`) directly in your browser or through your web server.
   - For backend functionality, ensure that the PHP files in the `words/` directory include the correct credentials for your database

---

## Sections and Usage

### People

- **Description:**  
  An interactive network graph of bands and members from the Bay Area punk scene. Nodes represent bands or individuals, and edges indicate collaborations or memberships.
- **Key Files:**  
  - `people.html` – Main interface with D3.js visualization.  
  - `merged-json.json` – JSON data for nodes and connections.


### Places

- **Description:**  
  A mapping interface that uses an ArcGIS embedded component to display key scene locations (venues, event sites).
- **Key Files:**  
  - `places.html` – The primary file containing the map.
  - `locations_latlong_split.csv` – Dataset with latitude and longitude information.
- **Usage:**  
  - Update the CSV file with new location data if repurposing for another scene.
  - Create a Public Account on ArcGIS, upload the CSV as a new layer, and update the embed link in places.html accordingly.
  - Adjust the embedded map’s settings (via HTML attributes or JavaScript) as needed.

### Words

- **Description:**  
  Visualization of lyrics from Lookout Records releases (1987–1994), featuring a word cloud and word association network.
- **Key Files:**  
  - `words.html` – Main interface for lyric visualization.
  - `songs.json` – Contains album, track, and lyrics data.
  - `missing_lyrics.json` and `missing-lyrics.html` – Display and invite contributions for missing lyrics.

### Shows

- **Description:**  
  A searchable and filterable historical database of punk events in the Bay Area (1976–1995), displayed in a responsive table.
- **Key Files:**  
  - `shows.html` – Contains the filters, table, and pagination controls.
  - `WILLUPDATEevents.json` – JSON file with event data.

### Gilman

- **Description:**  
  An interactive network visualization focusing on bands that performed at 924 Gilman between 1986 and 1994. Node sizes represent the number of shows, and edges represent shared performances.
- **Key Files:**  
  - `gilman.html` – Main front-end file using the vis-network library.
  - `weighted-bands.csv` – Contains band pairing and weight data.

---

## Customization and Repurposing

This suite is designed to be modular and adaptable. To repurpose it for another scene or cultural context, replace the data files with new datasets that follow the structures outlined below and update the front-end code as needed.

### Data Replacement

#### People: `merged-json.json`
- **Structure:**  
  A JSON object with two primary properties:
  - **nodes:** An array of objects, each representing a band or member.
    
    **Example:**
    ```json
    {
      "id": "Pinhead Gunpowder",
      "type": "band"
    }
    ```
  - **links:** An array of objects (if provided) defining relationships between nodes. Each object should include:
    - `source`: The id of the source node.
    - `target`: The id of the target node.
    - Optionally, additional metadata such as weight or type.
    
    **Example:**
    ```json
    {
      "source": "Pinhead Gunpowder",
      "target": "Lookouts"
    }
    ```

#### Places: `locations_latlong_split.csv`
- **Structure:**  
  A CSV file with one row per location. Expected columns include:
  - **Location Name** (or Venue)
  - **Latitude** (in decimal degrees)
  - **Longitude** (in decimal degrees)
  - Additional fields (if needed), such as Address, City, or State.
  
  **Example Row:**
  ```
  Gilman Street Project,37.869,-122.272
  ```

#### Words: `songs.json` and `missing_lyrics.json`
- **songs.json:**
  - **Structure:**  
    A JSON object where each key is an album title. The corresponding value is an object with:
    - `title`: Album title.
    - `year`: Release year.
    - `tracks`: An object where each key is a track title and its value is another object containing:
      - `artist`: The track artist.
      - `lyrics`: Full lyrics as a string.
      
    **Example:**
    ```json
    {
      "One Planet One People": {
        "title": "One Planet One People",
        "year": 1987,
        "tracks": {
          "Why Don't You Die": {
            "artist": "Lookouts",
            "lyrics": "I wanna know why you wanna kill me\nWhy don't you die..."
          }
        }
      }
    }
    ```
- **missing_lyrics.json:**
  - **Structure:**  
    A JSON object similar to `songs.json`, but only including tracks with missing lyrics. Each key is an album title and its value contains:
    - `title`: Album title.
    - `tracks`: An object where each key is a track title with missing lyrics. Each track object typically includes:
      - `artist`: The track artist.
      - Optionally, an empty or missing `lyrics` field.
      
    **Example:**
    ```json
    {
      "Sanitized": {
        "title": "Sanitized",
        "tracks": {
            "Down Inside": {
                "artist": "Monsula"
          }
        }
      }
    }
    ```

#### Shows: `events.json` (or `WILLUPDATEevents.json`)
- **Structure:**  
  A JSON array where each element is an event object with fields such as:
  - `Date`: Date of the event (formatted as YYYY-MM-DD).
  - `Artist`: Primary artist.
  - `Venue`: Venue name.
  - `Event Name`: Name or title of the event.
  - `City`: City where the event took place.
  - `State`: State abbreviation.
  - `Link to Setlist`: URL for the setlist (if available).
  - `Link to Flyer`: URL for the event flyer (if available).
  - `Link to Recording`: URL for any recordings of the event (if available).
  
  **Example:**
  ```json
  [
    {
      "Date": "1987-03-01",
        "Artist": "Crimpshrine",
        "Venue": "924 Gilman Street",
        "Event Name": "",
        "City": "Berkeley",
        "State": "CA",
        "Link to Setlist": "https://www.setlist.fm/setlist/crimpshrine/1987/924-gilman-street-berkeley-ca-2bf4b83a.html",
        "Link to Flyer": "",
        "Link to Recording": ""
    }
  ]
  ```

#### Gilman: `weighted-bands.csv`
- **Structure:**  
  A CSV file where each row represents a connection between two bands. Expected columns include:
  - **Source:** The name of the first band.
  - **Target:** The name of the second band.
  - **Weight:** A numeric value indicating the number of shared shows.
  
  **Example Row:**
  ```
  Lookouts,Pinhead Gunpowder,3
  ```

---

## Contributing

Contributions to enhance this suite are welcome! If you have suggestions, improvements, or bug fixes:
- Fork the repository and create a feature branch.
- Submit a pull request with a detailed description of your changes.
- For major changes, please open an issue first to discuss your proposed modifications.

---

## License

This project is licensed under the GPL-3.0 license. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- Credits to various data sources are in each file.
- Appreciation to all contributors and users who have supported and improved this project.


