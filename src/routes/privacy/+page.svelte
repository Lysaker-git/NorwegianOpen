<script lang="ts">
    let eventName = "NORWEGIAN OPEN 2026"
    const lastUpdated = "07/10/2026"
    const contactEmail = "norwegianopenwcs@gmail.com"
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
    <div class="max-w-4xl mx-auto">
      <!-- Title with ornamental borders -->
      <div class="flex items-center justify-center mb-10">
        <div class="h-px w-16 bg-amber-400"></div>
        <h1 class="text-4xl md:text-5xl font-bold text-center mx-4 text-white">PRIVACY POLICY</h1>
        <div class="h-px w-16 bg-amber-400"></div>
      </div>

      <!-- Update notice -->
      <div class="mb-8 rounded-lg border-2 border-amber-400 bg-amber-400/10 p-5 text-white">
        <p class="font-semibold text-amber-400 mb-1">Updated {lastUpdated}</p>
        <p class="text-sm">Updated: we now run a merch shop on this website. See "Shop orders" below for how we handle order details.</p>
      </div>

      <!-- Main text -->
      <div class="bg-[#232B3A] text-white rounded-lg p-6 md:p-10 shadow-xl border border-amber-400/30">
        <h2 class="text-2xl md:text-3xl font-bold text-amber-400 mb-6 mt-2">{eventName} PRIVACY POLICY</h2>
        <p class="mb-6">This policy explains how personal data is handled for {eventName}. We process personal data in line with the EU General Data Protection Regulation (GDPR) and the Norwegian Personal Data Act (personopplysningsloven).</p>

        <section class="mb-8">
          <h2 class="section-heading">Who is responsible</h2>
          <p class="mb-2">The data controller is Ida Marie Strand, organizer of {eventName}. For any privacy questions or requests, email <a href="mailto:{contactEmail}" class="link-style">{contactEmail}</a>.</p>
        </section>

        <section class="mb-8">
          <h2 class="section-heading">This website</h2>
          <p class="mb-2">This website does not handle event registration. It receives personal data in two places: the <a href="/shop" class="link-style">shop</a> (see "Shop orders" below) and the <a href="/contact" class="link-style">contact form</a> (your name, email address, and message). Contact form messages are delivered to our email inbox (Google Gmail) and only used to answer you.</p>
        </section>

        <section class="mb-8">
          <h2 class="section-heading">Shop orders</h2>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>What we collect:</strong> your name, email address, phone number, delivery choice, postal address (only if you choose shipping), the items you order, and your order and payment status.</li>
            <li><strong>Why:</strong> to process, deliver and follow up your order, and to email you updates about it (contract, GDPR Art. 6(1)(b)). Payment is made with Vipps directly between you and us; we do not receive or store any card or bank details.</li>
            <li><strong>Where it is stored:</strong> in our database at Supabase. Order emails are sent through Google Gmail, with a copy to our event inbox. These providers only process the data on our behalf; where data is processed outside the EEA, it is protected by the EU Standard Contractual Clauses.</li>
            <li><strong>How long:</strong> order records are kept for 5 years, as required by the Norwegian Bookkeeping Act (bokføringsloven). After that they are deleted.</li>
            <li><strong>Your order page:</strong> each order has a private link that only you receive by email. Anyone with that link can see the order, so please don't share it.</li>
          </ul>
        </section>

        <section class="mb-8">
          <h2 class="section-heading">Registration, payments & hotel bookings</h2>
          <p class="mb-2">All registration, payments, and hotel bookings for {eventName} are handled on <a href="https://dancepoint.no" target="_blank" rel="noopener noreferrer" class="link-style">DancePoint</a>. Your registration data is stored there, and DancePoint's privacy policy explains what is collected, how long it is kept, and how to use your rights. We use that data to run your registration, check-in, hotel booking, and competitions.</p>
        </section>

        <section class="mb-8">
          <h2 class="section-heading">Competitions & results</h2>
          <p class="mb-2">If you compete, your name, WSDC Competitor ID, contests entered, scores, and placements are used as follows:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><strong>Scoring.dance:</strong> our competition scoring system. Results, including your name, placements, and score reports, are published there and stay available for at least 30 days, as required by the WSDC.</li>
            <li><strong>World Swing Dance Council (WSDC):</strong> for WSDC Jack &amp; Jill contests we must send the WSDC the list of competitors, finalists' WSDC IDs, placements, and any petitions. Results are added to the public WSDC Points Registry.</li>
          </ul>
          <p class="mt-2">We do this because it is required to hold a WSDC Registry Event (legitimate interest, GDPR Art. 6(1)(f)). Competition results are kept permanently by the WSDC and Scoring.dance as a public record.</p>
        </section>

        <section class="mb-8">
          <h2 class="section-heading">Your rights</h2>
          <p class="mb-2">You have the right to:</p>
          <ul class="list-disc pl-6 space-y-2 mb-4">
            <li>see the personal data we hold about you and get a copy of it;</li>
            <li>have wrong data corrected;</li>
            <li>have your data deleted, unless we must keep it by law;</li>
            <li>object to or restrict how we use it, including photos and video used for promotion.</li>
          </ul>
          <p class="mb-2">Email <a href="mailto:{contactEmail}" class="link-style">{contactEmail}</a> to use any of these rights. For registration data, you can also manage your account on DancePoint. For shop orders, email us with your order number.</p>
          <p class="mb-2">Results already reported to the WSDC must be corrected or removed through the WSDC directly.</p>
          <p class="mb-2">If you think we handle your data wrongly, you can complain to the Norwegian Data Protection Authority, <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" class="link-style">Datatilsynet</a>.</p>
        </section>

        <section class="mb-8">
          <h2 class="section-heading">Photos & video</h2>
          <p class="mb-2">Official photographers and videographers film and photograph the event, including competitions. If you do not want to appear in promotional material, tell us at registration or check-in, or email us afterwards and we will remove published images of you where possible.</p>
        </section>

        <section class="mb-8">
          <h2 class="section-heading">Cookies</h2>
          <p class="mb-2">This website only uses cookies that are needed for it to work (for example, keeping organizers logged in to the admin area). We do not use advertising or tracking cookies.</p>
        </section>

        <p class="text-center mt-8 text-xs text-white">(Last Updated: {lastUpdated})</p>
      </div>
    </div>
  </div>
</div>

<style>
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0); }
  }
  h1, h2 { font-family: 'NorseBold'; }
  .section-heading { margin-top: 1rem; margin-bottom: 0.75rem; font-size: 1.125rem; font-weight: 600; color: #fde68a; }
  .rune { animation: float 5s ease-in-out infinite; opacity: 0.6; }
  @media (max-width: 640px) { .rune { font-size: 2rem; } }
  .text-amber-400 { color: #fbbf24; }
  .link-style { color: #fbbf24; text-decoration: underline; }
  .link-style:hover { color: #fde68a; }
</style>
