// Reusable home-page gallery generated from gallery.json.
import galleryImages from '../data/gallery.json'

function PhotoGallery() {
  return (
    <section className="photo-gallery" aria-labelledby="gallery-title">
      <h2 id="gallery-title">A Look Inside</h2>
      <p>Explore our food and family-friendly atmosphere.</p>

      <div className="gallery-grid">
        {galleryImages.map((image) => (
          <figure key={image.id} className="gallery-item">
            <img
              src={`${import.meta.env.BASE_URL}${image.src.replace(/^\//, '')}`}
              alt={image.alt}
              width="1200"
              height="800"
              loading="lazy"
              decoding="async"
            />

            <figcaption>{image.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

export default PhotoGallery
