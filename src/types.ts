export interface MapInfo {
  image: string
  dimensions: [number, number]
  attribution?: string
}

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
}

export interface Waypoint {
  id: number | string
  title: string
  description?: string
  coords: [number, number]
  category: string
}

export interface MapData {
  mapInfo: MapInfo
  categories: Category[]
  waypoints: Waypoint[]
}

export interface GameMapAttributes {
  'data-src'?: string
  'disable-zoom'?: boolean
  'disable-pan'?: boolean
  'initial-x'?: number
  'initial-y'?: number
  'initial-zoom'?: number
}

export type SizeSyncMode = 'auto' | 'host' | 'canvas' | 'none'
