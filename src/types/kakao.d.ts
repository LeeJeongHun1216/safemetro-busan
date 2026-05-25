/* Kakao Maps SDK global types */
export {}

declare global {
  interface Window {
    kakao: typeof kakao
  }

  namespace kakao.maps {
    class LatLng {
      constructor(lat: number, lng: number)
    }
    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      setCenter(latlng: LatLng): void
      setLevel(level: number): void
      getCenter(): LatLng
      getLevel(): number
    }
    interface MapOptions {
      center: LatLng
      level: number
    }
    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
      setPosition(position: LatLng): void
      setZIndex(zIndex: number): void
    }
    interface MarkerOptions {
      position: LatLng
      map?: Map
      image?: MarkerImage
      title?: string
      clickable?: boolean
      zIndex?: number
    }
    class MarkerImage {
      constructor(
        src: string,
        size: Size,
        options?: { offset?: Point; alt?: string; shape?: string; coords?: string; spriteSize?: Size }
      )
    }
    class Size {
      constructor(width: number, height: number)
    }
    class Point {
      constructor(x: number, y: number)
    }
    class CustomOverlay {
      constructor(options: CustomOverlayOptions)
      setMap(map: Map | null): void
      setPosition(position: LatLng): void
      setContent(content: string | HTMLElement): void
      setZIndex(zIndex: number): void
    }
    interface CustomOverlayOptions {
      position: LatLng
      content: string | HTMLElement
      map?: Map
      xAnchor?: number
      yAnchor?: number
      zIndex?: number
    }
    class InfoWindow {
      constructor(options: { content: string | HTMLElement; removable?: boolean })
      open(map: Map, marker: Marker): void
      close(): void
    }
    namespace event {
      function addListener(
        target: Map | Marker,
        type: string,
        handler: (...args: unknown[]) => void
      ): void
      function removeListener(
        target: Map | Marker,
        type: string,
        handler: (...args: unknown[]) => void
      ): void
    }
  }

  const kakao: {
    maps: {
      load(callback: () => void): void
      LatLng: typeof kakao.maps.LatLng
      Map: typeof kakao.maps.Map
      Marker: typeof kakao.maps.Marker
      MarkerImage: typeof kakao.maps.MarkerImage
      Size: typeof kakao.maps.Size
      Point: typeof kakao.maps.Point
      CustomOverlay: typeof kakao.maps.CustomOverlay
      InfoWindow: typeof kakao.maps.InfoWindow
      event: typeof kakao.maps.event
    }
  }
}
