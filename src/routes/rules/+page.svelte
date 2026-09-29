<script lang="ts">
    let eventName = "NORWEGIAN OPEN 2026"
    const lastUpdated = "29/09/2026"
    const wsdcRulesUrl = "https://www.worldsdc.com/wp-content/uploads/2026/03/Revised-WSDC-Registry-Event-Rules-Updated-Jan172026-V2026.1B.pdf"
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
            <div class="h-px w-16 bg-amber-400">
            </div>
            <h1 class="text-4xl md:text-5xl font-bold text-center mx-4 text-white">COMPETITION RULES</h1>
            <div class="h-px w-16 bg-amber-400">
            </div>
          </div>
          <!-- Styled banner -->
          <div class="mb-12 flex justify-center">
            <div class="relative">
              <h2 class="text-2xl md:text-3xl font-bold text-center border-t-2 border-b-2 border-amber-400 py-4 px-8 text-white">
                ~ The Rules ~
              </h2>
              <div class="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400"></div>
              <div class="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400"></div>
              <div class="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400"></div>
              <div class="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400"></div>
            </div>
          </div>

          <!-- Update notice -->
          <div class="mb-8 rounded-lg border-2 border-amber-400 bg-amber-400/10 p-5 text-white">
            <p class="font-semibold text-amber-400 mb-2">Updated {lastUpdated}</p>
            <p class="mb-2">These rules have been updated to follow the <a href={wsdcRulesUrl} target="_blank" rel="noopener noreferrer" class="link-style">2026 WSDC Registry Event Rules</a>. Main changes:</p>
            <ul class="list-disc pl-6 space-y-1 text-sm">
              <li>Clearer rules for primary and secondary roles, and how many Jack &amp; Jills you may enter.</li>
              <li>Petitions up are now allowed in either role; petitions down are for your primary role only.</li>
              <li>Which contests give WSDC points, and the definition of Sophisticated (35+).</li>
              <li>How divisions with too few entries are combined or cancelled.</li>
              <li>How contests are scored (callbacks in prelims, relative placement in finals) and how results are published.</li>
              <li>Lifts are now only allowed in Open Strictly Swing.</li>
            </ul>
          </div>

          <!-- Main text -->
          <div class="bg-[#232B3A] text-white backdrop-blur-sm rounded-lg p-6 md:p-10 shadow-xl border border-amber-400/30 transform transition-all hover:shadow-amber-400/20">
            <h2 class="text-2xl md:text-3xl font-bold text-amber-400 mb-6 mt-2">{eventName} COMPETITION RULES</h2>

            <p class="mb-6">Welcome to the {eventName}! These rules exist to provide a fair, fun, and spirited competition environment. They outline the requirements and expectations for all competitors. By registering for any competition, you agree to abide by these rules. {eventName} is a WSDC Registry Event, and where these rules do not cover a situation, the <a href={wsdcRulesUrl} target="_blank" rel="noopener noreferrer" class="link-style">WSDC Registry Event Rules (2026)</a> apply.</p>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                I. General Eligibility & Registration
              </h2>
              <p class="mb-4">To participate in any competition at {eventName}, all competitors must:</p>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li>Hold a valid event pass that permits competition entry (Full Pass or Party Pass).</li>
                <li>Register for each competition before the announced deadline. Competitions are registered and run through <a href="https://scoring.dance" target="_blank" rel="noopener noreferrer" class="link-style">Scoring.dance</a>; registration may also be completed at the Registration Desk while spots remain.</li>
                <li>Pay all required entry fees associated with their chosen competitions.</li>
                <li>Pick up their competitor bib number during the designated times and wear it visibly during all preliminary, semi-final, and final rounds. Bibs are recommended but may not be mandatory for spotlighted finals.</li>
                <li>Sign the event's legal waiver and release form.</li>
                <li>Meet the eligibility criteria for each division entered, as outlined in these rules and the WSDC Registry Event Rules.</li>
              </ul>
              <p class="mb-4"><strong class="font-semibold">Age:</strong> There is no minimum age to compete. Competitors under the age of 18 must have a parent or legal guardian sign the waiver on their behalf and give consent to compete, and should be comfortable and accustomed to social dancing in an adult environment.</p>
              <p class="mb-4"><strong class="font-semibold">Staff & Judges:</strong> Judges and event staff may compete, with the exceptions required by the WSDC (see Section IX).</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                II. Contests & WSDC Points
              </h2>
              <p class="mb-4">{eventName} is a WSDC Registry Event. The following contests award WSDC points:</p>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li><strong>WSDC Jack &amp; Jill skill-level contests:</strong> Newcomer, Novice, Intermediate, Advanced, and All-Star.</li>
                <li><strong>WSDC Sophisticated Jack &amp; Jill</strong> (age-based): open to competitors of all skill levels who are 35 years of age or older by the close of the event.</li>
              </ul>
              <p class="mb-4">The following contests do <strong>not</strong> award WSDC points: Strictly Swing (Novice, Intermediate, Open).</p>
              <p class="mb-4">There is no Champions, Masters, or Juniors Jack &amp; Jill at this event.</p>
              <p class="mb-4"><strong class="font-semibold">Points Registry:</strong> Your skill level is determined by the official <a href="https://www.worldsdc.com/registry-points/" target="_blank" rel="noopener noreferrer" class="link-style">WSDC Points Registry</a>, the WSDC Registry Event Rules, and the WSDC Skill Level Jack &amp; Jill Advancement Chart (below). Points are tracked separately for Leader and Follower roles.</p>
              <p class="mb-4"><strong class="font-semibold">Competitor Responsibility:</strong> You are responsible for knowing which divisions you are eligible for in both roles, and for using your WSDC Competitor ID when registering (you receive an ID once you earn your first point). If your WSDC ID or points are wrong, you are responsible for getting them corrected, either at the event or with the WSDC directly.</p>

              <h3 class="mt-6 mb-3 text-lg font-semibold text-amber-400">Skill Level Advancement Chart</h3>
              <div class="overflow-x-auto mb-4">
                <table class="w-full text-sm border border-gray-500">
                  <thead>
                    <tr class="bg-white/10 text-left">
                      <th class="p-2 border border-gray-500">Level</th>
                      <th class="p-2 border border-gray-500">Allowed to move up</th>
                      <th class="p-2 border border-gray-500">Required to move up</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td class="p-2 border border-gray-500">Newcomer</td><td class="p-2 border border-gray-500">At the dancer's discretion</td><td class="p-2 border border-gray-500">1 Newcomer point or 1 Novice point</td></tr>
                    <tr><td class="p-2 border border-gray-500">Novice</td><td class="p-2 border border-gray-500">16 Novice points</td><td class="p-2 border border-gray-500">30 Novice points or 1 Intermediate point</td></tr>
                    <tr><td class="p-2 border border-gray-500">Intermediate</td><td class="p-2 border border-gray-500">30 Intermediate points</td><td class="p-2 border border-gray-500">45 Intermediate points or 1 Advanced point</td></tr>
                    <tr><td class="p-2 border border-gray-500">Advanced</td><td class="p-2 border border-gray-500">60 Advanced points</td><td class="p-2 border border-gray-500">90 Advanced points or 1 All-Star point</td></tr>
                    <tr><td class="p-2 border border-gray-500">All-Star</td><td class="p-2 border border-gray-500">150 All-Star points</td><td class="p-2 border border-gray-500">225 All-Star points (Champion)</td></tr>
                    <tr><td class="p-2 border border-gray-500">Champion</td><td class="p-2 border border-gray-500">1 Champion point</td><td class="p-2 border border-gray-500">10 Champion points</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 class="mt-6 mb-3 text-lg font-semibold text-amber-400">Points Awarded per Tier</h3>
              <p class="mb-3">Tiers are set by the number of unique competitors in each role, so Leaders and Followers in the same division may be in different tiers. Reaching finals does not guarantee points. Points are only awarded if the final has at least 5 unique Leaders and 5 unique Followers. If you place twice in the same division, you only receive points for the higher placement.</p>
              <div class="overflow-x-auto mb-4">
                <table class="w-full text-sm border border-gray-500">
                  <thead>
                    <tr class="bg-white/10 text-left">
                      <th class="p-2 border border-gray-500">Tier</th>
                      <th class="p-2 border border-gray-500">Competitors per role</th>
                      <th class="p-2 border border-gray-500">1st</th>
                      <th class="p-2 border border-gray-500">2nd</th>
                      <th class="p-2 border border-gray-500">3rd</th>
                      <th class="p-2 border border-gray-500">4th</th>
                      <th class="p-2 border border-gray-500">5th</th>
                      <th class="p-2 border border-gray-500">Other finalists</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td class="p-2 border border-gray-500">1</td><td class="p-2 border border-gray-500">5–10</td><td class="p-2 border border-gray-500">3</td><td class="p-2 border border-gray-500">2</td><td class="p-2 border border-gray-500">1</td><td class="p-2 border border-gray-500">0</td><td class="p-2 border border-gray-500">0</td><td class="p-2 border border-gray-500">0</td></tr>
                    <tr><td class="p-2 border border-gray-500">2</td><td class="p-2 border border-gray-500">11–19</td><td class="p-2 border border-gray-500">6</td><td class="p-2 border border-gray-500">4</td><td class="p-2 border border-gray-500">3</td><td class="p-2 border border-gray-500">2</td><td class="p-2 border border-gray-500">1</td><td class="p-2 border border-gray-500">0</td></tr>
                    <tr><td class="p-2 border border-gray-500">3</td><td class="p-2 border border-gray-500">20–39</td><td class="p-2 border border-gray-500">10</td><td class="p-2 border border-gray-500">8</td><td class="p-2 border border-gray-500">6</td><td class="p-2 border border-gray-500">4</td><td class="p-2 border border-gray-500">2</td><td class="p-2 border border-gray-500">1 (up to 10th)</td></tr>
                    <tr><td class="p-2 border border-gray-500">4</td><td class="p-2 border border-gray-500">40–79</td><td class="p-2 border border-gray-500">15</td><td class="p-2 border border-gray-500">12</td><td class="p-2 border border-gray-500">10</td><td class="p-2 border border-gray-500">8</td><td class="p-2 border border-gray-500">6</td><td class="p-2 border border-gray-500">1 (up to 12th)</td></tr>
                    <tr><td class="p-2 border border-gray-500">5</td><td class="p-2 border border-gray-500">80–129</td><td class="p-2 border border-gray-500">20</td><td class="p-2 border border-gray-500">16</td><td class="p-2 border border-gray-500">14</td><td class="p-2 border border-gray-500">12</td><td class="p-2 border border-gray-500">10</td><td class="p-2 border border-gray-500">2 (up to 15th)</td></tr>
                    <tr><td class="p-2 border border-gray-500">6</td><td class="p-2 border border-gray-500">130+</td><td class="p-2 border border-gray-500">25</td><td class="p-2 border border-gray-500">22</td><td class="p-2 border border-gray-500">18</td><td class="p-2 border border-gray-500">15</td><td class="p-2 border border-gray-500">12</td><td class="p-2 border border-gray-500">2 (up to 15th)</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                III. Primary & Secondary Roles, and How Many Jack & Jills You May Enter
              </h2>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Primary role:</strong> the role in which you have points at the higher skill level. If you have points in both roles at your highest level, your primary role is the one with more points at that level.</li>
                <li><strong>Secondary role:</strong> your other role.</li>
                <li><strong>Entry limit:</strong> You may enter a maximum of <strong>two</strong> WSDC skill-level Jack &amp; Jills: one in your primary role and one in your secondary role, in two different divisions. You may not enter the same division in both roles. For example, you cannot enter All-Star, Intermediate, and Novice.</li>
                <li><strong>Sophisticated:</strong> If you qualify (35+), you may enter the Sophisticated Jack &amp; Jill in addition to your skill-level Jack &amp; Jills.</li>
                <li><strong>Strictly Swing:</strong> not limited by the above; see Section VII.</li>
              </ul>
              <p class="mb-2"><strong class="font-semibold">Secondary role level:</strong></p>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li>The WSDC recommends competing one level below the highest level you are allowed in your primary role. You may compete up to <strong>two</strong> levels below it.</li>
                <li>Once your secondary-role points reach the "allowed to move up" amount for a level, you may only compete one level below your primary level. (Example: an All-Star leader with 60+ Advanced points as a follower must follow in All-Star or Advanced.)</li>
                <li>Your highest allowed primary level sets your secondary limit, even if you choose to dance a lower level in your primary role at this event.</li>
                <li>If you have points in both roles at the same level, you must choose one role for that division.</li>
                <li><strong>Newcomer:</strong> You may enter Newcomer in either role if you have no points in either role. You may enter Newcomer in your secondary role only if you have fewer than 16 Novice points in your primary role and no points at any level in your secondary role. If you are allowed to compete in Intermediate in your primary role, you may not enter Newcomer in your secondary role.</li>
              </ul>
              <p class="mb-2"><strong class="font-semibold">No dancing down:</strong> This event does not run a Champions Jack &amp; Jill. You may not enter a lower division because your own division is not offered. Dancers who are required to compete in Champions (10+ Champion points or 225+ All-Star points) may not enter the All-Star Jack &amp; Jill without an approved petition.</p>
              <p class="mb-2"><strong class="font-semibold">Roles in a contest:</strong> You must keep your chosen role (Leader or Follower) throughout all rounds of a contest. Role switching during a competitive dance is not permitted for more than 8 beats.</p>
              <p class="mb-2">If you are unsure about your level or eligibility, check the WSDC Points Registry or contact the Chief Judge before registering.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                IV. Petitions
              </h2>
              <p class="mb-4">Petitions can only move you one division, up or down.</p>
              <p class="mb-4">
                  <strong class="font-semibold">Petition Down (primary role only):</strong> Submit a petition to the Chief Judge before the contest, as early as possible (
                      <a href="https://www.worldsdc.com/wp-content/uploads/2023/12/WSDC-Jack-and-Jill-petition_vF_Oct-2023.pdf" target="_blank" rel="noopener noreferrer" class="link-style">Petition down Form</a>
                  ). The Chief Judge, or people they appoint, will review your WSDC record and approve or deny it. Petitions down apply to this event only and cannot be transferred to other events.
              </p>
              <p class="mb-4">
                  <strong class="font-semibold">Petition Up (either role):</strong> Petitions up are submitted directly to the WSDC Chief Judges Committee at least <strong>15 days</strong> before the event, together with two videos of your dancing (
                      <a href="https://www.worldsdc.com/level-up-petition/" target="_blank" rel="noopener noreferrer" class="link-style">Petition up Form</a>
                  ). Approved petitions up are valid for six months and at other events. If you earn a point in the higher division, you stay in that division.
              </p>
              <p class="mb-4">
                  <strong class="font-semibold">Secondary Role:</strong> Petitions down are not allowed in your secondary role. Petitions up are allowed.
              </p>
              <p class="mb-4">
                  <strong class="font-semibold">Pending Points:</strong> If you qualify for a different division due to recent placements not yet shown in the WSDC registry, tell the Chief Judge the event, placement, tier, and event contact so they can verify it.
              </p>
              <p class="mb-4">
                  <strong class="font-semibold">Wrong Division:</strong> Competitors who dance in the wrong division without an approved petition will be disqualified and will not receive points.
              </p>
              <p class="mb-4">
                  Petitions are not approved to help a division reach a tier. All petitions are reported to the WSDC. Decisions on petitions are final. Be prepared to compete in your original division if your petition is denied.
              </p>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                V. Divisions With Too Few Entries
              </h2>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li>A WSDC division needs at least 5 Leaders and 5 Followers (Tier 1) when registration closes.</li>
                <li>If it does not, the Event Director may combine it with the neighbouring division (e.g., Advanced/All-Star) or cancel it.</li>
                <li>A combined contest awards points for the lower division (e.g., Advanced points for Advanced/All-Star). A combined Newcomer/Novice contest awards Novice points.</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                VI. Competitor Responsibilities & Conduct
              </h2>
              <p class="mb-4">Competitors are expected to uphold a high standard of conduct and personal responsibility.</p>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li><strong class="font-semibold">Know the Rules:</strong> Familiarize yourself with all competition rules and schedules. Competitors who do not follow the WSDC Registry Rules will not receive WSDC points. Ask the Chief Judge or event staff if anything is unclear.</li>
                <li><strong class="font-semibold">Be Prepared:</strong> Arrive at the ballroom 15–20 minutes before your scheduled competition and marshalling times. Check the <a href="/schedule" class="link-style">Norwegian Open Schedule</a> and the schedule posted at the event for updates.</li>
                <li><strong class="font-semibold">Marshalling:</strong> Listen for marshalling calls and proceed promptly to the designated area. Failure to be present when your heat or final is called may result in disqualification. Alternates may be called for finals if registered competitors are absent.</li>
                <li><strong class="font-semibold">Sportsmanship:</strong> Demonstrate respect towards partners, fellow competitors, judges, staff, and spectators at all times, both on and off the floor. Poor sportsmanship or disrespectful behavior may lead to penalties or disqualification.</li>
                <li><strong class="font-semibold">Communication:</strong> Address concerns or questions through official channels, such as speaking privately with the Chief Judge or Ida Marie Strand, our Event Director. Directly confronting, arguing with, or harassing judges or officials is prohibited and may result in disqualification and future bans.</li>
                <li><strong class="font-semibold">Withdrawals:</strong> Competition entry fees are non-refundable. If you must withdraw, please notify competition staff as soon as possible.</li>
              </ul>
            </section>

            <section class="mb-8">
                <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                  VII. Dance Requirements, Formats & Judging
                </h2>
                <p class="mb-4"><strong class="font-semibold">Swing Content:</strong> Competitions are focused on swing dancing, and judges expect recognizable swing content throughout. Jack &amp; Jill divisions primarily feature West Coast Swing.</p>
                <p class="mb-4"><strong class="font-semibold">Lead/Follow:</strong> Jack &amp; Jill and Strictly Swing competitions emphasize spontaneous lead/follow dancing. Pre-choreographed routines or significant amounts of choreographed sequences are not permitted.</p>
                <p class="mb-4"><strong class="font-semibold">Connection:</strong> Maintain appropriate physical dance connection with your partner throughout the dance, except during spins, turns, short breakaways, etc., that are natural parts of the dance.</p>
                <div class="mb-4">
                  <strong class="font-semibold block mb-1">Partner Weight Support & Lifts:</strong>
                  <ul class="list-disc pl-6 space-y-2">
                      <li>"On the ground" support moves (drops, slides, leans where connection to the floor is maintained) are permitted if executed safely and appropriately for a social dance context.</li>
                      <li>Lifts, aerials, and acrobatic moves where both of a partner's feet leave the floor are <strong class="font-bold text-red-600 uppercase">NOT ALLOWED</strong> in all Jack &amp; Jill contests (including All-Star and Sophisticated) and in Novice and Intermediate Strictly Swing.</li>
                      <li><em class="font-medium">Exception:</em> Limited lifts (below the shoulder) may be permitted <em class="font-medium">only</em> in Open Strictly Swing.</li>
                      <li>Any move deemed unsafe by the judges may result in a penalty. When in doubt, prioritize safety and leave it out.</li>
                  </ul>
                </div>
                <p class="mb-4"><strong class="font-semibold">Attire & Presentation:</strong> Dress appropriately for competition. Costumes are not allowed. Neat, complementary, or matching outfits suitable for swing dancing are encouraged, especially for Strictly Swing. Avoid overly casual wear like jeans. Attire should be tasteful and respectful, suitable for an all-ages audience. Check with the Chief Judge beforehand if you have questions about attire.</p>
                <div class="mb-6">
                  <strong class="font-semibold block mb-1">Judging Criteria:</strong>
                  <ol class="list-decimal pl-6 space-y-1 mt-2">
                      <li><strong class="font-medium">Timing:</strong> Dancing on time with the music, including rhythm and syncopations.</li>
                      <li><strong class="font-medium">Teamwork:</strong> Connection, lead/follow interaction, partnership, and mutual respect.</li>
                      <li><strong class="font-medium">Technique:</strong> Execution of footwork, body movement, balance, control, and spins/turns.</li>
                      <li><strong class="font-medium">Content:</strong> The spontaneous selection and execution of patterns appropriate to the dance style and music.</li>
                      <li><strong class="font-medium">Musicality:</strong> Interpretation of the music's style, tempo, phrasing, and mood.</li>
                      <li><strong class="font-medium">Presentation:</strong> Overall appearance, showmanship, and engagement, demonstrating positive chemistry and sportsmanship.</li>
                  </ol>
                </div>
              <div class="mb-6">
                <strong class="font-semibold block mb-2">Jack &amp; Jill (Newcomer, Novice, Intermediate, Advanced, All-Star, Sophisticated)</strong>
                <ul class="list-disc pl-6 space-y-2">
                    <li>Competitors enter individually.</li>
                    <li>Partner rotation in preliminary and semi-final rounds is random. Leaders and Followers are judged individually. Partners change between dances.</li>
                    <li>Finalists are randomly paired and judged as a couple. No redraws.</li>
                    <li>Music is selected by the event DJ and assigned fairly to all competitors.</li>
                </ul>
              </div>
              <div>
                <strong class="font-semibold block mb-2">Strictly Swing (Novice, Intermediate, Open) – non-WSDC</strong>
                <ul class="list-disc pl-6 space-y-2">
                    <li>Competitors enter as a pre-selected couple.</li>
                    <li>Couples dance to music selected by the event DJ.</li>
                    <li>Judged as a couple throughout all rounds.</li>
                    <li>Couples must enter the division matching the partner with the higher WSDC skill level (e.g., a Novice and an Intermediate must enter Intermediate). Anyone can enter Open Strictly.</li>
                    <li>Competitors may enter multiple Strictly Swing divisions but must have a <em class="font-medium">different partner</em> for each entry.</li>
                </ul>
              </div>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                VIII. Scoring, Results & Restarts
              </h2>
              <p class="mb-4"><strong class="font-semibold">Scoring System:</strong> All contests are scored with <a href="https://scoring.dance" target="_blank" rel="noopener noreferrer" class="link-style">Scoring.dance</a>, a computerized scoring system.</p>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Preliminary rounds</strong> (prelims, quarters, semis) use the WSDC callback system: Yes = 10, Alternate 1 = 4.5, Alternate 2 = 4.3, Alternate 3 = 4.2, No = 0. Callbacks are ranked by the total. Ties are broken by the Chief Judge's raw scores.</li>
                <li><strong>Finals</strong> use Relative Placement.</li>
                <li>Strictly Swing (non-WSDC) uses the same systems: callbacks in preliminary rounds and Relative Placement in finals.</li>
                <li>Finals in WSDC Jack &amp; Jills are judged by at least 5 judges, never an even number, plus the Chief Judge.</li>
              </ul>
              <p class="mb-4"><strong class="font-semibold">Results:</strong> Results are posted at the event and published on <a href="https://scoring.dance" target="_blank" rel="noopener noreferrer" class="link-style">Scoring.dance</a>, where they stay available for at least 30 days. Results include all rounds, placements, and score reports. Judges may be listed anonymously (Judge 1, Judge 2, etc.). If results turn out to be wrong, corrected results will be posted. WSDC Jack &amp; Jill results are reported to the WSDC Points Registry.</p>
              <p class="mb-4"><strong class="font-semibold">Restarts:</strong> A restart (e.g., wrong song, clothing malfunction, sound or lighting problems) can be requested by a competitor or the Chief Judge, but only the Chief Judge can approve it. The Chief Judge decides whether it happens immediately or later (e.g., at the end of the contest).</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                IX. Judging Integrity & Who May Compete
              </h2>
              <ul class="list-disc pl-6 space-y-2 mb-4">
                <li>Judges and event staff may compete in any contest they qualify for. A judge never judges a contest they are competing in.</li>
                <li>As required by the WSDC, the following may <strong>not</strong> compete in any swing contest at the event: the Event Director(s) and Owner(s) and their spouses and children, the Chief Judge, and the Scorer (the person running the scoring system). The Scorer also may not judge.</li>
                <li>Judges will not judge an immediate family member, current spouse or partner, established dance partner, or current business partner. Judges must report any such conflicts to the Chief Judge.</li>
              </ul>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                X. Organizer Rights & Final Authority
              </h2>
              <p class="mb-4">The {eventName} Organizers (Norvind WCS) and the Chief Judge may adjust schedules and formats, and combine or cancel divisions as described in Section V. Any change to these rules will be announced on this page and at the event, and will follow the WSDC Registry Event Rules.</p>
              <p class="mb-4">Decisions made by the Chief Judge and event officials on rule interpretations, eligibility, and placements are final and binding.</p>
            </section>

            <section class="mb-8">
              <h2 class="mt-10 mb-5 pb-2 border-b border-gray-300 text-xl sm:text-2xl font-medium text-white">
                XI. Contact Information
              </h2>
              <p class="mb-4">For questions regarding competition rules, please contact:</p>
              <ul class="list-none pl-0 space-y-2">
                <li><strong class="font-semibold inline-block w-32">Chief Judge:</strong> Henriette Koefoed Svendsen</li>
                <li><strong class="font-semibold inline-block w-32">Event Director:</strong> Ida Marie Strand</li>
                <li><strong class="font-semibold inline-block w-32">Event Website:</strong> <a href="/" class="link-style">Norwegianopen.no</a></li>
              </ul>
            </section>

            <p class="text-center mt-12 italic text-white">
              We wish all competitors the best of luck and a fantastic time at the {eventName}!
            </p>
            <p class="text-center mt-2 text-xs text-white">
              (Last Updated: {lastUpdated})
            </p>
          </div>
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
    .rune { animation: float 5s ease-in-out infinite; opacity: 0.6; }
    @media (max-width: 640px) { .rune { font-size: 2rem; } }
    .text-amber-400 { color: #fbbf24; }
    .link-style { color: #fbbf24; text-decoration: underline; }
    .link-style:hover { color: #fde68a; }
  </style>
