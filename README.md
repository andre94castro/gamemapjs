# Game Map Component

A reusable, dependency-free interactive map web component that can be dropped into any web project with a single line of HTML.

## 🚀 Quick Start

```html
<game-map data-src="path/to/your-map-data.json"></game-map>
<script src="dist/game-map.min.js"></script>
```

That's it! You now have a fully interactive map with pan, zoom, waypoints, and filtering.

## ✨ Features

- **🎯 Declarative & Simple**: One HTML element is all you need
- **📊 Data-Driven**: Everything is defined in external JSON files
- **🚫 Zero Dependencies**: Pure vanilla JavaScript Web Component
- **🔍 Interactive**: Pan, zoom, and explore your maps
- **🏷️ Filterable**: Dynamic filtering system based on waypoint categories
- **📱 Responsive**: Works on desktop and mobile devices

## 📁 Project Structure

```
/game-map-component/
├── dist/
│   └── game-map.min.js      # Production-ready minified component
├── src/
│   └── game-map.js          # Source code for development
├── demo/
│   ├── index.html           # Live demo page
│   └── assets/
│       ├── hyrule-map.png   # Demo map image
│       └── hyrule-data.json # Demo data file
├── package.json
└── README.md
```

## 🔧 Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Interactive Map</title>
    <style>
        game-map { 
            height: 100vh; 
            width: 100vw; 
        }
    </style>
</head>
<body>
    <game-map data-src="my-map-data.json"></game-map>
    <script src="dist/game-map.min.js"></script>
</body>
</html>
```

### Advanced Configuration

```html
<game-map 
    data-src="my-map-data.json"
    initial-x="100"
    initial-y="200" 
    initial-zoom="1.5"
    disable-zoom
    disable-pan>
</game-map>
```

## 📝 Data Format

Create a JSON file following this structure:

```json
{
  "mapInfo": {
    "image": "assets/my-map.png",
    "dimensions": [4096, 3584],
    "attribution": "Map attribution text"
  },
  "categories": [
    { 
      "id": "category1", 
      "name": "Display Name", 
      "color": "#FF0000" 
    }
  ],
  "waypoints": [
    {
      "id": 1,
      "title": "Waypoint Title",
      "description": "Description text",
      "coords": [x, y],
      "category": "category1"
    }
  ]
}
```

### Data Schema

#### `mapInfo`
- `image`: Path to your map image
- `dimensions`: [width, height] of the image in pixels
- `attribution`: Optional attribution text

#### `categories`  
- `id`: Unique identifier for filtering
- `name`: Display name in the filter UI
- `color`: Hex color for waypoint markers
- `icon`: Optional path to category icon

#### `waypoints`
- `id`: Unique identifier
- `title`: Display title for the waypoint
- `description`: Optional description shown on hover
- `coords`: [x, y] coordinates on the map image
- `category`: Must match a category ID

## 🎛️ API Reference

### HTML Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `data-src` | String | **Required.** Path to JSON data file |
| `disable-zoom` | Boolean | Disable mouse wheel zoom |
| `disable-pan` | Boolean | Disable map dragging |
| `initial-x` | Number | Starting X position |
| `initial-y` | Number | Starting Y position |  
| `initial-zoom` | Number | Starting zoom level |

### CSS Styling

The component uses Shadow DOM, so external styles won't interfere. You can style the host element:

```css
game-map {
    height: 500px;
    width: 800px;
    border: 1px solid #ccc;
    border-radius: 8px;
}
```

## 🛠️ Development

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd game-map-component

# Start development server
npm run serve
```

### Building
```bash
# Build minified version
npm run build
```

### Project Philosophy

This component follows three core principles:

1. **Declarative & Simple**: End users add maps with one line of HTML
2. **Data-Driven**: All content comes from external JSON files 
3. **Zero Dependencies**: Pure vanilla JavaScript Web Component

## 📄 License

MIT License - feel free to use this in any project!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test with the demo
5. Submit a pull request

## 📚 Examples

Check out the `/demo` directory for a complete working example with a Hyrule map from The Legend of Zelda: Breath of the Wild.