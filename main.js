document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('scroll-video');
  const videoContainer = document.getElementById('video-container');
  const mainContent = document.getElementById('main-content');
  const landingPage = document.querySelector('.landing-page');

  // ── Variáveis para interpolação suave (Lerp) ──
  let currentScroll = 0;
  let targetScroll = 0;
  const lerpFactor = 0.08;

  // ── Variáveis para trava de tempo ──
  const MIN_SEC_DURATION = 5000; // 5 segundos
  let startTime = Date.now();

  // ── Certifica-se de que o vídeo carregou seus metadados ──
  video.addEventListener('loadedmetadata', () => {
    video.pause();
    requestAnimationFrame(updateVideoProgress);
  });

  // ── Gatilho imediato para quando o vídeo já está no cache ──
  if (video.readyState >= 1) {
    video.pause();
    requestAnimationFrame(updateVideoProgress);
  }

  // ── Atualiza o targetScroll com base no scroll do mouse ──
  window.addEventListener('scroll', () => {
    const scrollHeight = mainContent.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    let scrollFraction = window.scrollY / scrollHeight;
    scrollFraction = Math.max(0, Math.min(1, scrollFraction));
    targetScroll = scrollFraction;
  });

  // ── Função de interpolação linear ──
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // ── Loop principal ──
  function updateVideoProgress() {
    // 1. Lerp para suavizar o scroll
    currentScroll = lerp(currentScroll, targetScroll, lerpFactor);

    // 2. Trava Temporal (Time Gating)
    let timeElapsed = Date.now() - startTime;
    let timeFactor = Math.min(1, timeElapsed / MIN_SEC_DURATION);

    // Progresso real: o menor entre o scroll suavizado e o fator de tempo
    let effectiveScroll = Math.min(currentScroll, timeFactor);

    // 3. Controlando o Tempo do Vídeo
    if (video.duration) {
      const targetTime = effectiveScroll * (video.duration - 0.05);
      if (targetTime >= 0 && targetTime <= video.duration) {
        video.currentTime = targetTime;
      }
    }

    // 4. Transição de Saída — desaparece nos últimos 30% (de 0.7 até 1.0)
    if (effectiveScroll >= 0.7) {
      // Mapeia 0.7→1.0 para 0.0→1.0
      let exitProgress = (effectiveScroll - 0.7) / 0.3;
      exitProgress = Math.min(1, exitProgress);

      // Scale diminui de 1.0 até 0.85
      let scaleValue = 1 - (0.15 * exitProgress);
      // BorderRadius aumenta até 40px
      let borderRadiusValue = 40 * exitProgress;
      // Opacidade cai de 1.0 até 0.0
      let opacity = 1 - exitProgress;

      videoContainer.style.transform = `scale(${scaleValue})`;
      videoContainer.style.borderRadius = `${borderRadiusValue}px`;
      videoContainer.style.opacity = opacity;

      // Esconde completamente quando terminado
      if (exitProgress >= 1) {
        videoContainer.style.visibility = 'hidden';
      } else {
        videoContainer.style.visibility = 'visible';
      }
    } else {
      // Estado normal
      videoContainer.style.transform = 'scale(1)';
      videoContainer.style.borderRadius = '0px';
      videoContainer.style.opacity = 1;
      videoContainer.style.visibility = 'visible';
    }

    // 5. Mostrar a página de destino quando o vídeo terminar (nos últimos 20% do scroll)
    if (effectiveScroll > 0.8) {
      landingPage.classList.add('visible');
    } else {
      landingPage.classList.remove('visible');
    }

    // 6. Fade out do Scroll Indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      if (effectiveScroll > 0.05) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.visibility = 'hidden';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.visibility = 'visible';
      }
    }

    requestAnimationFrame(updateVideoProgress);
  }

  // ── Lógica do Contador de CO2 ──
  const co2Counter = document.getElementById('co2-counter');
  let co2Value = 142580; // Valor inicial simulado (Kg)
  let counterStarted = false;

  function updateCounter() {
    co2Value += Math.floor(Math.random() * 5) + 1; // Incremento aleatório simulando uso real
    co2Counter.innerText = co2Value.toLocaleString('pt-BR');
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counterStarted) {
        counterStarted = true;
        // Animando do zero até o valor inicial para impacto visual
        let start = 0;
        let duration = 2000;
        let startTime = null;

        function animate(timestamp) {
          if (!startTime) startTime = timestamp;
          let progress = Math.min((timestamp - startTime) / duration, 1);
          let current = Math.floor(progress * co2Value);
          co2Counter.innerText = current.toLocaleString('pt-BR');
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setInterval(updateCounter, 2000); // Continua incrementando após a animação inicial
          }
        }
        requestAnimationFrame(animate);
      }
    });
  }, { threshold: 0.5 });

  if (co2Counter) {
    observer.observe(co2Counter);
  }
});
