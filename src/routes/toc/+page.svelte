<script lang="ts">
    let eventName = "NORWEGIAN OPEN 2025"
</script>
  
  <div class="relative min-h-screen overflow-hidden">
    <!-- Floating runes background -->
    <div class="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
      <div class="rune absolute text-4xl md:text-6xl top-1/4 left-1/4">ᚠ</div>
      <div class="rune absolute text-4xl md:text-6xl top-3/4 left-1/3">ᚨ</div>
      <div class="rune absolute text-4xl md:text-6xl top-1/2 left-2/3">ᚹ</div>
      <div class="rune absolute text-4xl md:text-6xl top-1/5 left-3/4">ᚦ</div>
      <div class="rune absolute text-4xl md:text-6xl top-2/3 left-1/5">ᛟ</div>
      <div class="rune absolute text-4xl md:text-6xl top-1/3 left-1/2">ᛏ</div>
    </div>
    <!-- Main content container -->
    <div class="container mx-auto px-4 py-12 relative z-10">
      <div class="transition-opacity duration-1000 opacity-100">
        <div class="max-w-4xl mx-auto">
          <!-- Title with ornamental borders -->
          <div class="flex items-center justify-center mb-10">
            <div class="h-px w-16 bg-amber-400"></div>
            <h1 class="text-4xl md:text-5xl font-bold text-center mx-4 text-white">TERMS & CONDITIONS</h1>
            <div class="h-px w-16 bg-amber-400"></div>
          </div>

          <!-- Styled banner -->
          <div class="mb-12 flex justify-center">
            <div class="relative">
              <h2 class="text-2xl md:text-3xl font-bold text-center border-t-2 border-b-2 border-amber-400 py-4 px-8 text-white">
                ~ Important Booking & Legal Information ~
              </h2>
              <div class="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400"></div>
              <div class="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400"></div>
              <div class="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400"></div>
              <div class="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400"></div>
            </div>
          </div>

          <!-- Main text -->
          <div class="bg-gray-800 text-white backdrop-blur-sm rounded-lg p-6 md:p-10 shadow-xl border border-amber-400/30 transform transition-all hover:shadow-amber-400/20">
            <h2 class="text-2xl md:text-3xl font-bold text-amber-400 mb-6 mt-2">{eventName} TERMS & CONDITIONS</h2>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Booking & Payment</h2>
              <p class="mb-2">Your spot at {eventName} is secured only once full payment for the selected pass has been received. For couple registrations, both parties must pay their share before the pass is considered secured.</p>
              <p class="mb-2">Ticket transfers are allowed but must be registered with the organizers to ensure correct contact and competitor details.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Cancellation & Refunds</h2>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li>Full refund if you cancel before <strong class="text-amber-200">1st June</strong>.</li>
                <li>If you cancel between <strong class="text-amber-200">1st June</strong> and <strong class="text-amber-200">30th June</strong>, you remain responsible for <strong>50%</strong> of the pass price.</li>
                <li>After <strong class="text-amber-200">1st July</strong> there are <strong class="text-red-400">no refunds</strong>; you are responsible for selling your ticket to another participant.</li>
              </ul>
              <p class="mb-2">If you transfer your ticket to another person, please inform the organizers so we can update registration and contact details.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Photography & Media</h2>
              <p class="mb-2">By attending {eventName}, you consent to being photographed or filmed by official event photographers and videographers. Images or footage may be used for promotional purposes. If you have concerns about being photographed, please contact the organizers on arrival.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Liability & Health</h2>
              <p class="mb-2">Participants attend at their own risk. The organizers and venue accept no liability for personal injury, loss, or damage to personal property except where required by law. You are responsible for your own health and fitness; do not participate in activities beyond your capability.</p>
              <p class="mb-2">If you feel unwell or infectious, please do not attend. We reserve the right to refuse entry to anyone showing signs of contagious illness.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Minors</h2>
              <p class="mb-2">Competitors under 18 must have parental/guardian consent. Guardians may be required to sign liability waivers and remain responsible for their child during the event.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Accessibility & Special Requirements</h2>
              <p class="mb-2">Please contact us in advance if you have accessibility needs, dietary requirements, or other special considerations so we can make reasonable accommodations.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Data & Privacy</h2>
              <p class="mb-2">We will store registration and contact details to communicate event updates, pass confirmations, and emergency information. We will not share your personal data with third parties except where necessary for event operations (e.g., venue, ticketing partners) or if required by law.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Code of Conduct & Safety</h2>
              <p class="mb-2">All attendees are expected to follow the {eventName} Code of Conduct. Harassment, discrimination, or unsafe behaviour will not be tolerated and may result in removal from the event without refund.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Force Majeure</h2>
              <p class="mb-2">The organizers are not liable for circumstances beyond their reasonable control (including, but not limited to, acts of God, government restrictions, pandemics, strikes, or venue closure). In such cases, we will make reasonable efforts to offer refunds, credit, or rescheduling, but cannot guarantee full reimbursement.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-4 mb-3 text-lg font-semibold text-amber-200">Refunds for Competition Withdrawals</h2>
              <p class="mb-2">Competition entry fees may be subject to separate refund rules. Check the specific competition terms when registering. For Strictly or Jack &amp; Jill entries, late withdrawals may not receive a refund.</p>
            </section>

            <p class="text-center mt-8 italic text-white">By completing registration and payment you agree to these Terms & Conditions.</p>
            <p class="text-center mt-4 text-xs text-white">(Last Updated: 30/09/2025)</p>
          </div>
        </div>
      </div>
    </div> 
    </div>
  
  <!-- Reusable styles (consider moving to a global CSS or component if used widely) -->
  <style global>
    .code-style {
      @apply bg-gray-100 px-2 py-0.5 mx-px text-sm rounded border border-gray-200 font-mono text-white align-middle inline-block; /* Added inline-block */
    }
    .link-style {
      @apply text-blue-600 hover:text-blue-800 hover:underline transition duration-200 ease-in-out;
    }
    body {
       margin: 0; /* Prevent potential default body margin */
    }
    h1, h2 { font-family: 'NorseBold'; }
    .rune { animation: float 5s ease-in-out infinite; opacity: 0.6; }
    @media (max-width: 640px) { .rune { font-size: 2rem; } }
    .bg-gray-800 { background-color: #232B3A; }
    .text-amber-400 { color: #fbbf24; }
    .text-amber-200 { color: #fde68a; }
    .text-amber-100 { color: #fef3c7; }
  </style>