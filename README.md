# AO3 2025 Wrapped

A small visualization tool for turning your AO3 reading statistics into a yearly “Wrapped” style report. Upload a prepared JSON stats file, and the app will render a dashboard with your total fics read, total words, top fandoms, relationships, authors, characters, tags, and longest reads.

> This is a frontend visualization project. The current version does not log in to AO3 or scrape your AO3 history automatically. You need to provide the stats JSON file yourself.

## Features

- Upload a local `.json` stats file
- Drag-and-drop or click-to-upload support
- Built-in demo data for previewing the UI
- Downloadable JSON template
- Reading summary cards for:
  - Total fics read
  - Total words and average words per fic
  - Top fandoms
  - Top relationships
  - Top authors
  - Favorite characters
  - Top tags
  - Longest reads
  - Book of the Year
- Clickable AO3 author, tag, and work-search links
- Local-only rendering: your JSON file is read in the browser and is not uploaded to a server

## Tech Stack

- React 19
- Create React App / `react-scripts`
- Tailwind CSS CDN
- Lucide React icons

## Local Development

Make sure Node.js and npm are installed.

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
```

The production build will be generated in the `build/` directory.

## JSON Data Format

The app validates these required fields:

- `totalFics`
- `totalWords`
- `top5Authors`
- `top3Fandoms`

Recommended full format:

```json
{
  "year": 2025,
  "totalFics": 128,
  "totalWords": 1540320,
  "longestFic": {
    "title": "Example Fic",
    "authors": ["ExampleAuthor"],
    "words": 245000,
    "url": "https://archiveofourown.org/works/123456"
  },
  "top5Authors": [
    ["Author 1", 15],
    ["Author 2", 12],
    ["Author 3", 8],
    ["Author 4", 6],
    ["Author 5", 5]
  ],
  "favCharacters": [
    ["Character 1", 45],
    ["Character 2", 38]
  ],
  "top3Fandoms": [
    ["Fandom 1", 52],
    ["Fandom 2", 34],
    ["Fandom 3", 15]
  ],
  "top5Tags": [
    ["Slow Burn", 20],
    ["Fluff", 18],
    ["Hurt/Comfort", 15]
  ],
  "favShips": [
    ["Character A/Character B", 30],
    ["Character C/Character D", 25]
  ],
  "longest5Fics": [
    {
      "title": "Example Fic",
      "authors": ["ExampleAuthor"],
      "words": 245000,
      "url": "https://archiveofourown.org/works/123456"
    }
  ]
}
```

Field notes:

- List-style stats use the `[name, count]` format.
- `url` is optional for `longestFic` and `longest5Fics`. If it is missing, the app creates an AO3 search link from the work title.
- `authors` is optional but recommended. It helps the app separate work titles from author names more accurately.
- `year` is optional. If it is missing, the app displays the current year.

## How to Use

1. Prepare an AO3 reading stats JSON file in the expected format.
2. Run the project and open the app in your browser.
3. Click the upload area or drag your JSON file into it.
4. View your generated yearly reading report.
5. To use another file, click `Upload New File` in the top-right corner.

If you do not have a data file yet, click `View Demo` to preview the app or `JSON Template` to download a starter template.

## Privacy

This app reads your JSON file locally in the browser. The current code has no backend service and does not upload your AO3 data anywhere.

Your JSON file may still contain private reading preferences, authors, ships, tags, and fandoms. Be careful before sharing real stats files publicly.

## Notes

- This project is not affiliated with AO3 or the OTW.
- If you generate your AO3 history data with a script, follow AO3’s usage guidelines and avoid making frequent automated requests.
- This project visualizes existing stats; it does not collect or scrape those stats for you.

## Possible Improvements

- Add image or PDF export buttons
- Add a mobile-friendly share-card layout
- Add a CSV-to-JSON converter
- Add more year, month, or fandom-specific stats
- Add a light theme or customizable theme colors

## License

No license has been declared in this repository yet. Consider adding one before publishing or reusing the project.
