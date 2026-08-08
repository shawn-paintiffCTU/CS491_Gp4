import { useEffect, useState } from 'react'
import galleryImages from '../data/gallery.json'

const AUTO_SCROLL_DELAY = 5000

function PhotoGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (
      isPaused ||
      reducedMotion ||
      galleryImages.length < 2
    ) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) =>
        (currentIndex + 1) % galleryImages.length,
      )
    }, AUTO_SCROLL_DELAY)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isPaused])

  function showPreviousImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0
        ? galleryImages.length - 1
        : currentIndex - 1,
    )
  }

  function showNextImage() {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex + 1) % galleryImages.length,
    )
  }

  function handleBlur(event) {
    if (
      !event.currentTarget.contains(event.relatedTarget)
    ) {
      setIsPaused(false)
    }
  }

  return (
    <section
      className="photo-gallery"
      aria-labelledby="gallery-title"
    >
      <h2 id="gallery-title">A Look Inside</h2>

      <p>
        Explore our food and family-friendly atmosphere.
      </p>

      <div
        className="gallery-carousel"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={handleBlur}
      >
        <div className="gallery-viewport">
          <div
            className="gallery-track"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
            }}
          >
            {galleryImages.map((image, imageIndex) => (
              <figure
                key={image.id}
                className="gallery-slide"
                aria-hidden={activeIndex !== imageIndex}
              >
                <img
                  src={`${import.meta.env.BASE_URL}${image.src.replace(
                    /^\//,
                    '',
                  )}`}
                  alt={image.alt}
                  width="1200"
                  height="800"
                  loading={
                    imageIndex === 0 ? 'eager' : 'lazy'
                  }
                  decoding="async"
                />

                <figcaption>
                  <strong>{image.caption}</strong>

                  <span>
                    Image {imageIndex + 1} of{' '}
                    {galleryImages.length}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div
          className="gallery-controls"
          aria-label="Gallery controls"
        >
          <button
            type="button"
            className="gallery-arrow"
            aria-label="Show previous image"
            onClick={showPreviousImage}
          >
            ‹
          </button>

          <div className="gallery-dots">
            {galleryImages.map((image, imageIndex) => (
              <button
                key={image.id}
                type="button"
                className={
                  imageIndex === activeIndex
                    ? 'gallery-dot gallery-dot-active'
                    : 'gallery-dot'
                }
                aria-label={`Show image ${imageIndex + 1}`}
                aria-current={
                  imageIndex === activeIndex
                    ? 'true'
                    : undefined
                }
                onClick={() => setActiveIndex(imageIndex)}
              />
            ))}
          </div>

          <button
            type="button"
            className="gallery-arrow"
            aria-label="Show next image"
            onClick={showNextImage}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  )
}

export default PhotoGallery