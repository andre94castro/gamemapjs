import type { MapData, GameMapAttributes, MapInfo } from '../types.js'
import { getData } from '../utils/load-map-data.js'

// game-map.ts - Reusable Map Web Component  
// A vanilla TypeScript Web Component for creating interactive maps
// Usage: <game-map data-src="path/to/map-data.json"></game-map>

export class GameMap extends HTMLElement {
  private mapData: MapData | null = null
  private currentZoom = 1
  private currentX = 0
  private currentY = 0
  private isDragging = false
  private lastPointerX = 0
  private lastPointerY = 0
  private readonly minZoom = 0.1
  private readonly maxZoom = 5
  private readonly activeFilters = new Set<string>()

  static get observedAttributes (): string[] {
    return ['data-src', 'disable-zoom', 'disable-pan', 'initial-x', 'initial-y', 'initial-zoom']
  }

  constructor () {
    super()
    this.attachShadow({ mode: 'open' })

    import('./async-loader.js').then(async ({ loadStyles }) => {
      if(this.shadowRoot) {
        this.shadowRoot.adoptedStyleSheets = [await loadStyles()]
      }
    })
  }

  connectedCallback (): void {
    this.shadowRoot?.append(document.createElement('canvas'))
    this.setupEventListeners()
  }

  attributeChangedCallback (name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'data-src' && oldValue !== newValue) {
      this.loadMapData(newValue).then(() => this.render(this.mapData))
      // TODO: Load new data when data-src changes
    }
  }

  private async loadMapData(src: string | null): Promise<void> {
    if (!src) return;
    try {
      this.mapData = await getData(src);
      console.log(this.mapData)
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  private render (data: MapData | null): void {
    const canvas: HTMLCanvasElement | null | undefined = this.shadowRoot?.querySelector('canvas')
    const ctx: CanvasRenderingContext2D | null | undefined = canvas?.getContext('2d')

    if(!canvas || !ctx || !data) {
      return
    }

    ctx.save()
    ctx.scale(this.currentZoom, this.currentZoom)
    ctx.translate(this.currentX, this.currentY)
    
    this.drawImageBackground(ctx, data.mapInfo)
    
    ctx.restore()
  }

  private setupEventListeners (): void {
    const canvas = this.shadowRoot?.querySelector('canvas')
    if (!canvas) return

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
      const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.currentZoom * zoomFactor))
      
      if (newZoom !== this.currentZoom) {
        this.currentZoom = newZoom
        this.render(this.mapData)
      }
    })
  }

  private createWaypoints (): void {
    // TODO: Create waypoint markers from data
  }

  private createFilters (): void {
    // TODO: Create dynamic filter system based on categories
  }

  private updateTransform (): void {
    // TODO: Update map viewport transform for pan/zoom
  }

  private drawImageBackground (ctx: CanvasRenderingContext2D, info: MapInfo) : void {
      const img = new Image()
      const canvas = ctx.canvas

      img.onload = () => {
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.save()
        ctx.scale(this.currentZoom, this.currentZoom)
        ctx.translate(this.currentX, this.currentY)
        ctx.drawImage(img, 0, 0)
        ctx.restore()
      }

      img.src = info.image

  }



}

// Register the custom element
customElements.define('game-map', GameMap)