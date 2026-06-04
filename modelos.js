document.addEventListener('DOMContentLoaded', () => {
  const canvasMini = document.getElementById('canvas-mini');
  const contextMini = canvasMini.getContext('2d');
  const sectionMini = document.getElementById('dolphin-mini');

  const frameCount = 240;
  
  // Define dimensions based on the aspect ratio of the images (e.g. 16:9 or similar)
  // You can adjust these if your images have a different resolution.
  canvasMini.width = 1920;
  canvasMini.height = 1080;

  // Generate frame path based on the structure we found
  const currentFrame = index => (
    `/byd-mini/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`
  );

  const images = [];
  let imagesLoaded = 0;

  // Pre-load images to ensure smooth scrolling
  const preloadImages = () => {
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);

      img.onload = () => {
        imagesLoaded++;
        if(imagesLoaded === 1) {
          // Draw the very first image as soon as it's ready
          requestAnimationFrame(() => updateImage(0));
        }
      }
    }
  };

  const updateImage = index => {
    if (images[index] && images[index].complete) {
      contextMini.drawImage(images[index], 0, 0, canvasMini.width, canvasMini.height);
    }
  };

  preloadImages();

  // Scroll logic using Lerp for smoothness
  let currentScrollFraction = 0;
  let targetScrollFraction = 0;
  const lerpFactor = 0.08;

  window.addEventListener('scroll', () => {
    // We calculate progress only for the dolphin-mini section
    const rect = sectionMini.getBoundingClientRect();
    
    // rect.top is 0 when the top of the section hits the top of the viewport
    // The section needs to be taller than the viewport for scrolling to occur
    const maxScroll = rect.height - window.innerHeight;
    
    // How far we have scrolled inside this section
    const scrollPosition = -rect.top;

    if (scrollPosition >= 0 && scrollPosition <= maxScroll) {
      // User is scrolling inside the section
      targetScrollFraction = scrollPosition / maxScroll;
    } else if (scrollPosition > maxScroll) {
      targetScrollFraction = 1;
    } else if (scrollPosition < 0) {
      targetScrollFraction = 0;
    }
  });

  // Animation Loop for smooth updates
  function renderLoop() {
    // Interpolate towards the target fraction
    currentScrollFraction += (targetScrollFraction - currentScrollFraction) * lerpFactor;
    
    // Map to frame index (0 to frameCount - 1)
    const frameIndex = Math.min(
      frameCount - 1,
      Math.floor(currentScrollFraction * frameCount)
    );

    updateImage(frameIndex);

    // Animate the left card to rise slowly
    const leftCard = document.getElementById('mini-info-left');
    if (leftCard) {
      // Moves up by 60% of the viewport height over the full scroll
      leftCard.style.transform = `translateY(-${currentScrollFraction * 60}vh)`;
    }

    requestAnimationFrame(renderLoop);
  }

  requestAnimationFrame(renderLoop);

});
