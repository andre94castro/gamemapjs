import type { MapData, GameMapAttributes, MapInfo, SizeSyncMode } from '../types.js'
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
  private sizeSync: SizeSyncMode = 'auto'
  private canvasEl: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null
  private hostRO?: ResizeObserver
  private canvasRO?: ResizeObserver
  private rafId: number | null = null
  private pendingResize = false
  private lastLayoutFrom: 'host' | 'canvas' | null = null

  static get observedAttributes (): string[] {
    return ['data-src', 'disable-zoom', 'disable-pan', 'initial-x', 'initial-y', 'initial-zoom', 'size-sync']
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
    if (!this.shadowRoot) return
    // Prefer an existing canvas provided by tests or external setup
    const existing = this.shadowRoot.querySelector('canvas') as HTMLCanvasElement | null
    if (existing) {
      this.canvasEl = existing
    } else if (!this.canvasEl) {
      this.canvasEl = document.createElement('canvas')
      this.shadowRoot.append(this.canvasEl)
    }
    if (!this.ctx && this.canvasEl && typeof (this.canvasEl as any).getContext === 'function') {
      this.ctx = this.canvasEl.getContext('2d')
    }
    this.setupEventListeners()
    this.setupSizeObservers()
    // Ensure initial sizing is applied
    this.handleResize('host')
  }

  disconnectedCallback (): void {
    this.hostRO?.disconnect?.()
    this.canvasRO?.disconnect?.()
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  attributeChangedCallback (name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return
    if (name === 'data-src') {
      this.loadMapData(newValue).then(() => this.render(this.mapData))
    } else if (name === 'size-sync') {
      this.sizeSync = this.normalizeSizeSync(newValue)
      // Re-evaluate size on mode change
      this.handleResize('host')
      this.handleResize('canvas')
    }
  }

  private async loadMapData(src: string | null): Promise<void> {
    if (!src) return;
    try {
      this.mapData = await getData(src);
      // Set initial zoom to fit the viewport after loading data
      this.initializeZoom();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  private initializeZoom(): void {
    const canvas = this.shadowRoot?.querySelector('canvas')
    if (!canvas || !this.mapData) return
    
    // Start with a reasonable zoom level (1.0), don't start at minimum
    this.currentZoom = 1.0
  }

  private render (data: MapData | null): void {
    const canvas = this.canvasEl
    const ctx = this.ctx
    if(!canvas || !ctx || !data) {
      return
    }
    // Prepare DPR transform before drawing
    this.applyDPRTransform()

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
      const zoomFactor = e.deltaY < 0 ? 1.1 : 1/1.1
      this.zoom(zoomFactor)
    })

    canvas.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        this.zoom(1.1)
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        this.zoom(1/1.1)
      }
    })

    canvas.setAttribute('tabindex', '0')
  }

  private zoom(factor: number): void {
    const newZoom = Math.max(1.0, Math.min(this.maxZoom, this.currentZoom * factor))
    
    if (newZoom !== this.currentZoom) {
      this.currentZoom = newZoom
      this.render(this.mapData)
    }
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
      // Determine effective size sync behavior
      const effective = this.resolveEffectiveMode()
      if (effective === 'canvas') {
        // Canvas controls size; set CSS pixels to the image natural size
        this.setCanvasCssSize(img.naturalWidth, img.naturalHeight)
        this.syncHostToCanvas()
      } else {
        // Host controls or disabled; canvas fills host via CSS, clear any inline canvas size
        this.clearCanvasCssSizeInline()
      }

      // Match drawing buffer to CSS size and DPR
      this.resizeDrawingBufferToCanvasCss()

      // Clear and draw
      const css = this.getCanvasCssSize()
      ctx.clearRect(0, 0, css.width, css.height)
      ctx.save()
      ctx.scale(this.currentZoom, this.currentZoom)
      ctx.translate(this.currentX, this.currentY)
      ctx.drawImage(img, 0, 0)
      ctx.restore()
    }
    img.src = info.image
  }

  private setupSizeObservers(): void {
    const RO = (globalThis as any).ResizeObserver
    if (!this.canvasEl) return
    if (RO) {
      const hostRO = new RO((entries: ResizeObserverEntry[]) => {
        // Only react when host is the source of truth
        this.handleResize('host')
      })
      this.hostRO = hostRO
      hostRO.observe(this)

      const canvasRO = new RO((entries: ResizeObserverEntry[]) => {
        // React when canvas CSS box changes
        this.handleResize('canvas')
      })
      this.canvasRO = canvasRO
      const canvasEl = this.canvasEl as HTMLCanvasElement
      canvasRO.observe(canvasEl)
    } else {
      // Fallback: at least respond to window resizes
      window.addEventListener('resize', () => {
        this.handleResize('host')
      })
    }
  }

  private handleResize(origin: 'host' | 'canvas'): void {
    if (!this.canvasEl) return
    const effective = this.resolveEffectiveMode()
    if (effective === 'none') return

    if (origin === 'host' && (effective === 'host' || (effective === 'auto' && this.hostHasExplicitSize()))) {
      // Host drives size; canvas fills host via CSS (100%)
      this.clearCanvasCssSizeInline()
      this.lastLayoutFrom = 'host'
      this.pendingResize = true
      this.scheduleRender()
    } else if (origin === 'canvas' && (effective === 'canvas' || (effective === 'auto' && !this.hostHasExplicitSize()))) {
      // Canvas drives; sync host to canvas
      this.lastLayoutFrom = 'canvas'
      this.syncHostToCanvas()
      this.pendingResize = true
      this.scheduleRender()
    } else {
      // Regardless of origin, ensure buffer matches CSS size
      this.pendingResize = true
      this.scheduleRender()
    }
  }

  private scheduleRender(): void {
    if (this.rafId != null) return
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null
      if (this.pendingResize) {
        this.resizeDrawingBufferToCanvasCss()
        this.pendingResize = false
      }
      this.render(this.mapData)
    })
  }

  private getHostCssSize(): { width: number, height: number } {
    const rect = this.getBoundingClientRect()
    return { width: Math.max(0, Math.round(rect.width)), height: Math.max(0, Math.round(rect.height)) }
  }

  private getCanvasCssSize(): { width: number, height: number } {
    if (!this.canvasEl) return { width: 0, height: 0 }
    const rect = this.canvasEl.getBoundingClientRect()
    return { width: Math.max(0, Math.round(rect.width)), height: Math.max(0, Math.round(rect.height)) }
  }

  private setCanvasCssSize(width: number, height: number): void {
    if (!this.canvasEl) return
    this.canvasEl.style.width = `${Math.max(0, Math.round(width))}px`
    this.canvasEl.style.height = `${Math.max(0, Math.round(height))}px`
  }

  private clearCanvasCssSizeInline(): void {
    if (!this.canvasEl) return
    this.canvasEl.style.width = ''
    this.canvasEl.style.height = ''
  }

  private syncHostToCanvas(): void {
    // Set host inline size to match canvas CSS size (in CSS pixels)
    const css = this.getCanvasCssSize()
    if (css.width > 0) this.style.width = `${css.width}px`
    if (css.height > 0) this.style.height = `${css.height}px`
  }

  private resizeDrawingBufferToCanvasCss(): void {
    if (!this.canvasEl) return
    const dpr = Math.max(1, Math.floor((window.devicePixelRatio || 1)))
    const css = this.getCanvasCssSize()
    const targetW = Math.max(1, css.width * dpr)
    const targetH = Math.max(1, css.height * dpr)
    if (this.canvasEl.width !== targetW || this.canvasEl.height !== targetH) {
      this.canvasEl.width = targetW
      this.canvasEl.height = targetH
    }
    this.applyDPRTransform()
  }

  private applyDPRTransform(): void {
    if (!this.ctx || !this.canvasEl) return
    const maybeSetTransform = (this.ctx as any).setTransform
    if (typeof maybeSetTransform === 'function') {
      const dpr = Math.max(1, Math.floor((window.devicePixelRatio || 1)))
      // Ensure 1 CSS px maps to 1 unit in canvas space after transform
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
  }

  private hostHasExplicitSize(): boolean {
    const cs = getComputedStyle(this)
    const wAuto = cs.width === 'auto'
    const hAuto = cs.height === 'auto'
    const w = parseFloat(cs.width)
    const h = parseFloat(cs.height)
    // Consider explicit if either dimension is not auto and > 0
    return (!wAuto && w > 0) || (!hAuto && h > 0)
  }

  private normalizeSizeSync(val: string | null): SizeSyncMode {
    if (!val) return 'auto'
    const v = val.toLowerCase().trim()
    return (v === 'host' || v === 'canvas' || v === 'none' || v === 'auto') ? v : 'auto'
  }

  private resolveEffectiveMode(): SizeSyncMode {
    if (this.sizeSync === 'auto') {
      return this.hostHasExplicitSize() ? 'host' : 'canvas'
    }
    return this.sizeSync
  }



}

// Register the custom element
customElements.define('game-map', GameMap)
