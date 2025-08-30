export const sampleMapData = {
  mapInfo: {
    image: "assets/map-images/test-map.png",
    dimensions: [1024, 768],
    attribution: "Test Map Data"
  },
  categories: [
    { 
      id: "shrine", 
      name: "Shrines", 
      icon: "icons/shrine.svg",
      color: "#00FFFF" 
    },
    { 
      id: "tower", 
      name: "Towers",
      icon: "icons/tower.svg",
      color: "#FFD700"
    }
  ],
  waypoints: [
    {
      id: 1,
      title: "Test Tower",
      description: "A test tower for unit testing.",
      coords: [500, 400],
      category: "tower"
    },
    {
      id: 2,
      title: "Test Shrine",
      description: "A test shrine for component testing.",
      coords: [300, 200],
      category: "shrine"
    }
  ]
}