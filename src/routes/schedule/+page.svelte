<script lang="ts">
    import NowSch1 from '$lib/components/images/schedule/NowSch1.jpg';
    import NowSch2 from '$lib/components/images/schedule/NowSch2.jpg';
    import NowSch3 from '$lib/components/images/schedule/NowSch3.jpg';
</script>

<div class="px-4 sm:px-6 md:px-8 max-w-5xl mx-auto mt-8">
    <div class="p-4">
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
</style>