<script lang="ts">
    import NowSch1 from '$lib/components/images/schedule/NowSch1.jpg';
    import NowSch2 from '$lib/components/images/schedule/NowSch2.jpg';
    import NowSch3 from '$lib/components/images/schedule/NowSch3.jpg';
    import levels from '$lib/components/images/levels/levels.jpg';
</script>

<div class="px-4 sm:px-6 md:px-8 max-w-5xl mx-auto mt-8">
    <div class="p-4">
        <iframe
            src="https://dancepoint.no/events/2ffe1eb9-3fe2-428b-b66e-7f3ecfb858a4/embed/schedule"
            title="Norwegian Open WCS 2026 schedule"
            class="w-full shadow-md schedule-frame border border-gray-700 mb-6"
        ></iframe>

        <img
            src={levels}
            alt="Levels overview"
            class="w-full shadow-md schedule-img border border-gray-700 mb-6"
        />

        <details class="bg-gray-800 text-white rounded-md p-4 mt-4" aria-label="Last year's schedule accordion">
            <summary class="cursor-pointer font-semibold text-lg outline-none">Last year's schedule — reference (expand to view)</summary>
            <div class="mt-4">
                <img
                    src={NowSch1}
                    alt="Schedule Part 1"
                    class="w-full shadow-md schedule-img border border-gray-700"
                />
                <img
                    src={NowSch2}
                    alt="Schedule Part 2"
                    class="w-full shadow-md schedule-img border border-gray-700"
                />
                <img
                    src={NowSch3}
                    alt="Schedule Part 3"
                    class="w-full shadow-md schedule-img border border-gray-700"
                />
            </div>
        </details>
        <p class="mt-4 text-lg text-gray-300 text-center">
            Please note that this schedule is subject to change. Stay tuned for updates!
        </p>
    </div>
</div>

<style>
    h1 {
        font-family: 'NorseBold'
    }
    .schedule-img {
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        background: #18181b;
    }
    .schedule-img:last-of-type {
        margin-bottom: 0;
    }
    .schedule-frame {
        height: 85vh;
        min-height: 700px;
        border-radius: 0.5rem;
        background: #18181b;
    }
</style>