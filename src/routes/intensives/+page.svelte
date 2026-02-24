<script>
  import { fade } from 'svelte/transition';
</script>

<svelte:head>
  <title>Intensives - Norwegian Open WCS 2026</title>
</svelte:head>

<div class="container mx-auto px-4 md:px-8 py-12">
  <div class="text-white" in:fade={{ duration: 600, delay: 100 }}>
    <h1 class="text-4xl md:text-5xl font-bold mb-8 text-center" style="font-family: 'NorseBold', sans-serif;">
      Event Intensives
    </h1>
    <div class="max-w-3xl mx-auto mb-12">
      <p class="text-lg md:text-xl text-center mb-4">
        Take your Norwegian Open WCS 2026 experience to the next level with our exclusive intensives! Whether you want to master the groove of blues or unlock your expressive styling, these special sessions are designed to inspire and elevate your dancing.
      </p>
    </div>
  </div>

  <!-- Joel & Chantelle Blues Intensive -->
  <div in:fade={{ duration: 600, delay: 200 }}>
    <div class="max-w-3xl mx-auto mb-16 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6 md:p-8">
        <h2 class="text-2xl md:text-3xl font-bold mb-4 text-amber-300" style="font-family: 'NorseBold', sans-serif;">
          The Blues Intensive ⚔️🌿✨
        </h2>
        <p class="text-lg mb-4 text-white">
          Step into the groove and discover how to make West Coast Swing feel effortless and confident to blues music! In this 3-hour intensive with Champions <span class="font-semibold text-amber-200">Joel & Chantelle</span>, you’ll learn how to adapt your basics, connection, and styling so the blues becomes something you look forward to on the social floor.
        </p>
        <ul class="mb-4 text-white">
          <li><span class="font-bold text-amber-200">🎶 When:</span> Friday, October 3rd – 11:00 to 14:00</li>
          <li><span class="font-bold text-amber-200">📍 Where:</span> Norwegian Open WCS 2026</li>
          <li><span class="font-bold text-amber-200">💰 Price:</span> 1000 NOK</li>
        </ul>
        <div class="p-4 border-l-4 bg-gray-900 border-blue-500 text-white mb-4">
          <p class="text-lg font-medium">
            👉 Secure your spot now – bookings are open in the Google Sheets document below:
            <br>
            <a href="https://forms.gle/wZjAk7pTKFUaEL3y6" target="_blank" rel="noopener noreferrer" class="text-blue-200 hover:underline">Sign up for the Blues Intensive</a>
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Fernanda's Follower Styling Intensive -->
  <div in:fade={{ duration: 600, delay: 300 }}>
    <div class="max-w-3xl mx-auto mb-16 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6 md:p-8">
        <h2 class="text-2xl md:text-3xl font-bold mb-4 text-amber-300" style="font-family: 'NorseBold', sans-serif;">
          Follower Styling Intensive with Fernanda Dubiel ✨
        </h2>
        <!-- Fernanda Flavour Text -->
        <div class="mb-4 text-white text-base md:text-lg">
          <p class="mb-3">
            This masterclass is all about helping you feel more free, expressive, and intentional in your West Coast Swing dancing. You’ll work on things like:
          </p>
          <ul class="list-disc list-inside space-y-1 pl-4">
            <li><span class="font-semibold text-amber-200">Arm styling</span> that flows naturally with your movement without interrupting the lead</li>
            <li><span class="font-semibold text-amber-200">Body shaping</span> to add dimension and softness to your basics</li>
            <li><span class="font-semibold text-amber-200">Transitions</span> – how to move from anchor to prep with grace and awareness</li>
            <li><span class="font-semibold text-amber-200">Musicality</span> through feminine accents and pauses</li>
            <li><span class="font-semibold text-amber-200">Presence and confidence</span> – not by doing more, but by doing it with purpose</li>
          </ul>
          <p class="mt-3">
            This is not about showing off. It’s about being in the music and letting your movement speak for itself. Whether you’re social dancing or competing – Fernanda will guide you to bring more of you into your dance.
          </p>
        </div>
        <p class="text-lg mb-4 text-white">
          We’re beyond excited to announce that our very own social media manager — and incredible pro dancer — <span class="font-semibold text-amber-200">Fernanda Dubiel</span> is bringing something extra special to Norwegian Open WCS 2026!
        </p>
        <ul class="mb-4 text-white">
          <li><span class="font-bold text-amber-200">🎶 When:</span> Saturday, October 4th – 10:15 to 11:45</li>
          <li><span class="font-bold text-amber-200">📍 Where:</span> Norwegian Open WCS 2026</li>
          <li><span class="font-bold text-amber-200">💰 Price:</span> 400 NOK</li>
        </ul>
        <div class="p-4 border-l-4 bg-gray-900 border-blue-500 text-white mb-4">
          <p class="text-lg font-medium">
            ✨ Spots are limited, so grab yours now through our Google Sheets sign-up form below.<br>
            📅 Don’t miss this chance to learn from Fernanda in person!
            <br>
            <a href="https://forms.gle/wZjAk7pTKFUaEL3y6" target="_blank" rel="noopener noreferrer" class="text-blue-200 hover:underline">Sign up for Fernanda's Intensive</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>