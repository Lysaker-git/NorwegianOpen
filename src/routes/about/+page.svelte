<!-- src/routes/about/+page.svelte -->
<script>
    import { onMount } from 'svelte';
  
    let isVisible = false;
    
    onMount(() => {
      // Fade in animation on page load
      setTimeout(() => {
        isVisible = true;
      }, 100);
      
      // Set up rune floating animation
      const runes = document.querySelectorAll('.rune');
      runes.forEach(rune => {
        const randomDelay = Math.random() * 5;
        const randomDuration = 3 + Math.random() * 2;
        rune.style.animationDelay = `${randomDelay}s`;
        rune.style.animationDuration = `${randomDuration}s`;
      });
    });
  </script>
  
  <div class="relative min-h-screen overflow-hidden">
    <!-- Floating runes background -->
    <div class="absolute inset-0 overflow-hidden opacity-20">
      <div class="rune absolute text-4xl md:text-6xl top-1/4 left-1/4">ᚠ</div>
      <div class="rune absolute text-4xl md:text-6xl top-3/4 left-1/3">ᚨ</div>
      <div class="rune absolute text-4xl md:text-6xl top-1/2 left-2/3">ᚹ</div>
      <div class="rune absolute text-4xl md:text-6xl top-1/5 left-3/4">ᚦ</div>
      <div class="rune absolute text-4xl md:text-6xl top-2/3 left-1/5">ᛟ</div>
      <div class="rune absolute text-4xl md:text-6xl top-1/3 left-1/2">ᛏ</div>
    </div>
    
    <!-- Northern lights effect -->
    
    <!-- Main content container -->
    <div class="container mx-auto px-4 py-12 relative z-10">
      <!-- Header with Norse-inspired border -->
      <div class={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div class="max-w-4xl mx-auto">
          <!-- Title with ornamental borders -->
          <div class="flex items-center justify-center mb-10">
            <div class="h-px w-16 bg-amber-400"></div>
            <h1 class="text-4xl md:text-5xl font-bold text-center mx-4 text-white">ABOUT THE EVENT</h1>
            <div class="h-px w-16 bg-amber-400"></div>
          </div>
          
          <!-- Styled banner -->
          <div class="mb-12 flex justify-center">
            <div class="relative">
              <h2 class="text-2xl md:text-3xl font-bold text-center border-t-2 border-b-2 border-amber-400 py-4 px-8 text-white">
                ~ The Saga Begins ~
              </h2>
              <!-- Norse corner decorations -->
              <div class="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400"></div>
              <div class="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400"></div>
              <div class="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400"></div>
              <div class="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400"></div>
            </div>
          </div>
          
          <!-- Main text -->
          <div class="bg-gray-400 backdrop-blur-sm rounded-lg p-6 md:p-10 shadow-xl border border-amber-400/30 transform transition-all hover:shadow-amber-400/20">
            <p class="mb-6 text-lg leading-relaxed">
              In the ancient lands where Odin wanders and the echoes of Valhalla still whisper through the fjords, a new legend is about to be born.
            </p>
            <p class="mb-6 text-lg leading-relaxed">
              This October, under the first full moon of fall, Norway shall open its gates to warriors of West Coast Swing from across the nine realms. Under the watchful eyes of Frigg and Freyja, you'll form legendary bonds in Strictly duels, battle in epic Jack & Jill tournaments (yes - rewarded with precious WSDC points!), and delve into ancient wisdom and knowledge, led by the master sages of swing.
            </p>
            <p class="mb-6 text-lg leading-relaxed">
              But the true magic? It lies in the night - when the music flows like mead through the halls of Asgard and every dance becomes a magical tale worthy of the skalds.
            </p>
            <p class="mb-8 text-lg leading-relaxed">
              Prepare your feet. Ready your hearts. Among the mythical fjords and the ancient forests, warriors and wanderers from all corners of Midgard will unite to honour the unyielding love of West Coast Swing.
            </p>
            
            <div class="border-t border-amber-400/30 pt-6 mt-8">
              <p class="text-lg text-amber-200 font-semibold">
                Say hello to Norway's new WSDC Trial Event! We're so excited to share more magical joy of West Coast Swing in this country and dance with you all in october.
              </p>
              <p class="mt-4 text-lg text-amber-100">
                Save the date (and book your flights), and make sure to keep yourselves updated on this new, glorious adventure
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom decoration -->
    </div>
  </div>
  
  <style>
    @keyframes float {
      0% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
      100% {
        transform: translateY(0);
      }
    }
    
    h1, h2 {
        font-family: 'NorseBold'
    }
    .rune {
      animation: float 5s ease-in-out infinite;
      opacity: 0.6;
    }
    
    /* Add some custom responsiveness */
    @media (max-width: 640px) {
      .rune {
        font-size: 2rem;
      }
    }
  </style>