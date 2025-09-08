import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameMap } from '../../src/web-component/game-map.js'

// Mock the async loader
vi.mock('../../src/web-component/async-loader.js', () => ({
  loadStyles: vi.fn().mockResolvedValue(new CSSStyleSheet())
}))

// Mock the data loader
vi.mock('../../src/utils/load-map-data.js', () => ({
  getData: vi.fn().mockResolvedValue({
    mapInfo: {
      image: 'test.png',
      dimensions: [1000, 800]
    },
    categories: [],
    waypoints: []
  })
}))

describe('GameMap', () => {
  let gameMap: GameMap
  let canvas: HTMLCanvasElement
  let mockContext: CanvasRenderingContext2D

  beforeEach(() => {
    // Ensure ResizeObserver absence doesn't break
    ;(globalThis as any).ResizeObserver = undefined
    // Create a fresh GameMap instance
    gameMap = new GameMap()
    
    // Mock canvas and context
    canvas = document.createElement('canvas')
    canvas.width = 500
    canvas.height = 400
    canvas.clientWidth = 500
    canvas.clientHeight = 400
    
    mockContext = {
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      canvas: canvas
    } as any
    
    Object.defineProperty(canvas, 'getContext', {
      value: vi.fn().mockReturnValue(mockContext),
      writable: true
    })
    
    // Mock shadowRoot
    const mockShadowRoot = {
      querySelector: vi.fn().mockReturnValue(canvas),
      adoptedStyleSheets: [],
      append: vi.fn()
    } as any
    
    vi.spyOn(gameMap, 'shadowRoot', 'get').mockReturnValue(mockShadowRoot)
    
    // Add to DOM to trigger connectedCallback
    document.body.appendChild(gameMap)
  })

  describe('size-sync attribute', () => {
    it('defaults to auto when not set', () => {
      // Access private for test purposes
      expect((gameMap as any)['sizeSync']).toBe('auto')
    })

    it('accepts host/canvas/none and normalizes unknown to auto', () => {
      ;(gameMap as any).attributeChangedCallback('size-sync', null, 'host')
      expect((gameMap as any)['sizeSync']).toBe('host')

      ;(gameMap as any).attributeChangedCallback('size-sync', 'host', 'canvas')
      expect((gameMap as any)['sizeSync']).toBe('canvas')

      ;(gameMap as any).attributeChangedCallback('size-sync', 'canvas', 'none')
      expect((gameMap as any)['sizeSync']).toBe('none')

      ;(gameMap as any).attributeChangedCallback('size-sync', 'none', 'weird')
      expect((gameMap as any)['sizeSync']).toBe('auto')
    })
  })

  describe('zoom functionality', () => {
    beforeEach(() => {
      // Set up initial state
      gameMap['currentZoom'] = 1.0
      gameMap['mapData'] = {
        mapInfo: { image: 'test.png', dimensions: [1000, 800] },
        categories: [],
        waypoints: []
      }
    })

    it('should zoom in with factor 1.1', () => {
      const initialZoom = gameMap['currentZoom']
      gameMap['zoom'](1.1)
      
      expect(gameMap['currentZoom']).toBe(initialZoom * 1.1)
    })

    it('should zoom out with factor 1/1.1', () => {
      gameMap['currentZoom'] = 2.0
      const zoomOutFactor = 1 / 1.1
      
      gameMap['zoom'](zoomOutFactor)
      
      expect(gameMap['currentZoom']).toBeCloseTo(2.0 * zoomOutFactor)
    })

    it('should not zoom below minimum zoom of 1.0', () => {
      gameMap['currentZoom'] = 1.0
      
      gameMap['zoom'](0.5) // Try to zoom out
      
      expect(gameMap['currentZoom']).toBe(1.0)
    })

    it('should not zoom above maximum zoom of 5.0', () => {
      gameMap['currentZoom'] = 5.0
      
      gameMap['zoom'](2.0) // Try to zoom in further
      
      expect(gameMap['currentZoom']).toBe(5.0)
    })

    it('should not change zoom if new zoom equals current zoom', () => {
      gameMap['currentZoom'] = 1.0
      const renderSpy = vi.spyOn(gameMap as any, 'render')
      
      gameMap['zoom'](1.0) // No change
      
      expect(gameMap['currentZoom']).toBe(1.0)
      expect(renderSpy).not.toHaveBeenCalled()
    })

    it('should call render when zoom changes', () => {
      const renderSpy = vi.spyOn(gameMap as any, 'render')
      
      gameMap['zoom'](1.1)
      
      expect(renderSpy).toHaveBeenCalledWith(gameMap['mapData'])
    })
  })

  describe('keyboard events', () => {
    beforeEach(() => {
      gameMap['currentZoom'] = 1.0
      gameMap['mapData'] = {
        mapInfo: { image: 'test.png', dimensions: [1000, 800] },
        categories: [],
        waypoints: []
      }
    })

    it('should zoom in when + key is pressed', () => {
      const event = new KeyboardEvent('keydown', { key: '+' })
      const zoomSpy = vi.spyOn(gameMap as any, 'zoom')
      
      canvas.dispatchEvent(event)
      
      expect(zoomSpy).toHaveBeenCalledWith(1.1)
    })

    it('should zoom in when = key is pressed', () => {
      const event = new KeyboardEvent('keydown', { key: '=' })
      const zoomSpy = vi.spyOn(gameMap as any, 'zoom')
      
      canvas.dispatchEvent(event)
      
      expect(zoomSpy).toHaveBeenCalledWith(1.1)
    })

    it('should zoom out when - key is pressed', () => {
      const event = new KeyboardEvent('keydown', { key: '-' })
      const zoomSpy = vi.spyOn(gameMap as any, 'zoom')
      
      canvas.dispatchEvent(event)
      
      expect(zoomSpy).toHaveBeenCalledWith(1 / 1.1)
    })

    it('should zoom out when _ key is pressed', () => {
      const event = new KeyboardEvent('keydown', { key: '_' })
      const zoomSpy = vi.spyOn(gameMap as any, 'zoom')
      
      canvas.dispatchEvent(event)
      
      expect(zoomSpy).toHaveBeenCalledWith(1 / 1.1)
    })

    it('should prevent default behavior for zoom keys', () => {
      const event = new KeyboardEvent('keydown', { key: '+' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      canvas.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not respond to other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a' })
      const zoomSpy = vi.spyOn(gameMap as any, 'zoom')
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      canvas.dispatchEvent(event)
      
      expect(zoomSpy).not.toHaveBeenCalled()
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })

  describe('wheel events', () => {
    beforeEach(() => {
      gameMap['currentZoom'] = 2.0
      gameMap['mapData'] = {
        mapInfo: { image: 'test.png', dimensions: [1000, 800] },
        categories: [],
        waypoints: []
      }
    })

    it('should zoom in when wheel scrolls up', () => {
      const event = new WheelEvent('wheel', { deltaY: -100 })
      const zoomSpy = vi.spyOn(gameMap as any, 'zoom')
      
      canvas.dispatchEvent(event)
      
      expect(zoomSpy).toHaveBeenCalledWith(1.1)
    })

    it('should zoom out when wheel scrolls down', () => {
      const event = new WheelEvent('wheel', { deltaY: 100 })
      const zoomSpy = vi.spyOn(gameMap as any, 'zoom')
      
      canvas.dispatchEvent(event)
      
      expect(zoomSpy).toHaveBeenCalledWith(1 / 1.1)
    })

    it('should prevent default wheel behavior', () => {
      const event = new WheelEvent('wheel', { deltaY: -100 })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')
      
      canvas.dispatchEvent(event)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })
})
