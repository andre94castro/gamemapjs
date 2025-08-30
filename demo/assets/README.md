# Demo Assets

This directory contains demo assets for the game map component.

## Files Needed

- **hyrule-map.png** - The actual map image file (you'll need to add this)
- **hyrule-data.json** - The data file defining waypoints and categories (already created)

## Map Image

To complete the demo, you'll need to add a map image file named `hyrule-map.png`. This should be the actual map image that the waypoints will be placed on.

The coordinates in `hyrule-data.json` assume the image dimensions are 4096x3584 pixels, as specified in the mapInfo section.

## Adding Your Own Maps

To create your own map demo:

1. Add your map image to this directory
2. Create a new JSON file following the same structure as `hyrule-data.json`
3. Update the `data-src` attribute in `index.html` to point to your new JSON file

The component will automatically load and display any map that follows the JSON schema.