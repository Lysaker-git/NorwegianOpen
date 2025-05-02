<script>
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import ScandicFront from '$lib/images/ScandicFront.avif';
    import ScandicRoom from '$lib/images/ScandicRoom.avif';
  
    let isLoaded = false;
  
    onMount(() => {
      setTimeout(() => {
        isLoaded = true;
      }, 100);
    });
  </script>
  
  <svelte:head>
    <title>Location - Norwegian Open WCS 2025</title>
  </svelte:head>
  
  <div class="container mx-auto px-4 md:px-8 py-12">
    {#if isLoaded}
      <div class="text-white" in:fade={{ duration: 600, delay: 200 }}>
        <h1 class="text-4xl md:text-5xl font-bold mb-8 text-center" style="font-family: 'NorseBold', sans-serif;">Event Location</h1>
  
        <div class="max-w-3xl mx-auto mb-12">
          <p class="text-lg md:text-xl text-center mb-4">
            Norwegian Open WCS 2025 will be hosted at the spectacular Scandic Hamar hotel,
            offering modern facilities and comfortable accommodations for our dance event.
            Conveniently located in the heart of Hamar, it provides the perfect venue for our weekend of West Coast Swing.
          </p>
        </div>
      </div>
  
      <div in:fade={{ duration: 600, delay: 300 }}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div class="relative overflow-hidden rounded-lg shadow-lg">
            <img
              src={ScandicFront}
              alt="Front view of Scandic Hamar hotel"
              class="w-full h-64 md:h-80 object-cover transition-transform duration-500 hover:scale-105"
            />
            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3">
              <p class="text-white font-medium">Scandic Hamar - Exterior</p>
              <p class="text-xs text-gray-500 mt-1 italic">Copyright: Kyrre Sundal</p>
            </div>
          </div>
  
          <div class="relative overflow-hidden rounded-lg shadow-lg">
            <img
              src={ScandicRoom}
              alt="Foyer of Scandic Hamar hotel"
              class="w-full h-64 md:h-80 object-cover transition-transform duration-500 hover:scale-105"
            />
            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-3">
              <p class="text-white font-medium">Scandic Hamar - Foyer</p>
              <p class="text-xs text-gray-500 mt-1 italic">Copyright: Kyle Meyr</p>
            </div>
          </div>
        </div>
      </div>
  
      <div in:fade={{ duration: 600, delay: 400 }}>
        <div class="max-w-3xl mx-auto mb-16">
          <h2 class="text-white text-3xl font-bold mb-6 border-b border-gray-300 pb-3" style="font-family: 'NorseBold', sans-serif;">Hotel Information</h2>
  
          <div class="bg-gray-100 p-6 rounded-lg text-gray-800 mb-8">
            <h3 class="font-bold text-xl mb-3" style="font-family: 'NorseBold', sans-serif;">Scandic Hamar</h3>
            <p class="mb-2">Vangsveien 121, 2318 Hamar, Norway</p>
            <p class="mb-2">Phone: +47 21 61 40 00</p>
            <p><a href="https://www.scandichotels.com/hotels/norway/hamar/scandic-hamar" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Visit hotel website</a></p>
          </div>
  
          <p class="text-lg mb-4 text-white">
            The hotel features modern amenities including a restaurant, bar, and comfortable rooms,
            making it the perfect venue for our dance event. The spacious ballroom will host our main competitions
            and social dancing, while additional rooms will be used for workshops.
          </p>
        </div>
      </div>
  
      <div in:fade={{ duration: 600, delay: 500 }}>
        <div class="max-w-3xl mx-auto mb-16">
          <h2 class="text-3xl font-bold mb-6 border-b border-gray-300 pb-3 text-white text-white" style="font-family: 'NorseBold', sans-serif;">Getting There</h2>
  
          <h3 class="font-bold text-xl mb-3" style="font-family: 'NorseBold', sans-serif;">By Train</h3>
          <p class="text-lg mb-6 text-white ">
            Hamar is easily accessible by train from Oslo Airport (Gardermoen) and Oslo Central Station.
            Direct trains run frequently, with a journey time of approximately 44 minutes from the airport
            and 1 hour and 10 minutes from Oslo Central. From Hamar station, Scandic Hamar is a short 10-minute walk or quick taxi ride.
          </p>
  
          <h3 class="text-white font-bold text-xl mb-3" style="font-family: 'NorseBold', sans-serif;">By Car</h3>
          <p class="text-lg mb-6 text-white ">
            If you prefer to drive, Hamar is located approximately 125 km north of Oslo via the E6 highway.
            The hotel offers parking facilities for guests, making it convenient for those arriving by car.
          </p>
        </div>
      </div>
  
      <div in:fade={{ duration: 600, delay: 600 }}>
        <div class="max-w-3xl mx-auto">
          <h2 class="text-white text-3xl font-bold mb-6 border-b border-gray-300 pb-3" style="font-family: 'NorseBold', sans-serif;">Booking Your Stay</h2>
  
          <div class="p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-800 mb-8">
            <p class="text-lg font-medium">
              Room reservations for Norwegian Open WCS can be made through our event registration form,
              which will secure our special discounted event rate.
            </p>
          </div>
  
          <p class="text-white text-lg mb-4">
            We have negotiated a special rate for event participants. To receive this rate,
            please book your accommodation through our registration system rather than directly with the hotel.
            This ensures you're part of our room block and helps us meet our event commitments.
          </p>
  
          <p class="text-white text-lg mb-4">
            Registration will open soon - make sure to follow our social media channels
            for announcements about when you can book your spot at Norwegian Open WCS 2025!
          </p>
        </div>
      </div>
    {/if}
  </div>
